from django.shortcuts import render
from satellites.helpers import get_satellite, get_satellite_passes, satellites, get_pass_timeline, tz, get_all_satellites
from datetime import datetime, timedelta
from django.http import HttpRequest, HttpResponse
from dateutil import parser
from django.utils import timezone
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from satellites.serializers import EarthSatelliteSerializer

#################
# API Templates
#################

@api_view(['GET'])
@csrf_exempt
def get_satellites(request):
    serializer = EarthSatelliteSerializer(data=satellites, many=True)
    serializer.is_valid()
    return Response(data={'data': serializer.data})

@api_view(['GET'])
@csrf_exempt
def get_passes(request: HttpRequest, id: str) -> HttpResponse:

    visible_only = request.GET.get('visible_only', 'true') == 'true'

    satellite = get_satellite(id)

    t0 = datetime.now(tz)
    t1 = t0 + timedelta(days=20)

    events = get_satellite_passes([id], t0, t1, visible_only)

    return Response(data={'data': events})

@api_view(['GET'])
@csrf_exempt
def get_pass_details(request: HttpRequest, id: str, start: int, end: int) -> HttpResponse:

    satellite = get_satellite(id)

    t0 = datetime.utcfromtimestamp(start).astimezone(tz)
    t1 = datetime.utcfromtimestamp(end).astimezone(tz)
    
    timeline = get_pass_timeline(id, t0, t1, steps=50)

    return Response(data={'data': timeline})

@api_view(['GET'])
@csrf_exempt
def get_predictions(request: HttpRequest) -> HttpResponse:

    visible_only = request.GET.get('visible_only', 'true') == 'true'

    t0 = datetime.now(tz)
    t1 = t0 + timedelta(hours=1)

    ids = [ s.model.satnum for s in get_all_satellites() ]

    events = get_satellite_passes(ids, t0, t1, visible_only)

    return Response(data={'data': events})

#################
# Page Templates
#################

def home(request: HttpRequest) -> HttpResponse:
    return render(request, 'satellites/list.html')

def detail(request: HttpRequest, id: str) -> HttpResponse:

    visible_only = request.GET.get('visible_only', 'true') == 'true'

    satellite = get_satellite(id)

    t0 = datetime.now(tz)
    t1 = t0 + timedelta(days=20)

    return render(request, 'satellites/detail.html',
                  context={'satellite': satellite,
                           'visible_only': visible_only,
                           't0': t0.astimezone(tz),
                           't1': t1.astimezone(tz)})

def predictions(request: HttpRequest) -> HttpResponse:

    visible_only = request.GET.get('visible_only', 'true') == 'true'

    t0 = datetime.now(tz)
    t1 = t0 + timedelta(hours=1)

    return render(request, 'satellites/predictions.html',
                  context={'visible_only': visible_only,
                            't0': t0.astimezone(tz),
                            't1': t1.astimezone(tz)})

def pass_timeline(request: HttpRequest, id: str) -> HttpResponse:

    satellite = get_satellite(id)

    t0 = parser.parse(request.GET.get('start'))
    t1 = parser.parse(request.GET.get('end'))
    
    return render(request, 'satellites/pass.html',
                  context={'satellite': satellite,
                           'start': t0.astimezone(tz),
                           'end': t1.astimezone(tz)})
