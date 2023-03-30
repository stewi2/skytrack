from datetime import datetime, timedelta, timezone

from dateutil import parser
from django.http import HttpRequest, HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.cache import cache_control
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .forms import SettingsForm
from .utils import get_all_satellites, get_pass_timeline, get_satellite, get_satellite_passes, get_all_groups
from .serializers import EarthSatelliteSerializer

#################
# API Templates
#################

@api_view(["GET"])
@csrf_exempt
def get_groups(request):
    return Response(data={'data': [g for g in get_all_groups() if g!='NORAD']})

@api_view(['GET'])
@csrf_exempt
@cache_control(max_age=3600)
def get_satellites(request):
    serializer = EarthSatelliteSerializer(data=get_all_satellites('NORAD'), many=True)
    serializer.is_valid()
    return Response(data={'data': serializer.data})

@api_view(['GET'])
@csrf_exempt
def get_passes(request: HttpRequest, id: str) -> HttpResponse:

    visible_only = request.GET.get('visible_only', 'true') == 'true'
    lat = float(request.GET.get('lat', request.session.get('lat')))
    lon = float(request.GET.get('lon', request.session.get('lon')))

    satellite = get_satellite(id, 'NORAD')

    t0 = datetime.utcnow().replace(tzinfo=timezone.utc)
    t1 = t0 + timedelta(days=20)

    events = get_satellite_passes([satellite], t0, t1, lat, lon, visible_only)

    serializer = EarthSatelliteSerializer(data=[satellite], many=True)
    serializer.is_valid()

    return Response(data={'satellite': serializer.data[0], 'data': events})

@api_view(['GET'])
@csrf_exempt
def get_pass_details(request: HttpRequest, id: str, start: int, end: int) -> HttpResponse:

    lat = float(request.GET.get('lat', request.session.get('lat')))
    lon = float(request.GET.get('lon', request.session.get('lon')))

    satellite = get_satellite(id, 'NORAD')

    t0 = datetime.utcfromtimestamp(start).replace(tzinfo=timezone.utc)
    t1 = datetime.utcfromtimestamp(end).replace(tzinfo=timezone.utc)
    
    timeline = get_pass_timeline(satellite, t0, t1, lat, lon, steps=50)

    serializer = EarthSatelliteSerializer(data=[satellite], many=True)
    serializer.is_valid()

    return Response(data={'satellite': serializer.data[0], 'data': timeline})

@api_view(['GET'])
@csrf_exempt
def get_predictions(request: HttpRequest) -> HttpResponse:

    visible_only = request.GET.get('visible_only', 'false') == 'true'
    lat = float(request.GET.get('lat', request.session.get('lat')))
    lon = float(request.GET.get('lon', request.session.get('lon')))
    group = request.GET.get('group', 'Starlink')
    start = request.GET.get('start', str(datetime.utcnow().timestamp()))
    duration = request.GET.get('duration', '60')

#    t0 = datetime.utcnow().replace(tzinfo=timezone.utc)
#    t1 = t0 + timedelta(hours=1)

    t0 = datetime.fromtimestamp(int(start), tz=timezone.utc)
    t1 = t0 + timedelta(minutes=int(duration))

    satellites = get_all_satellites(group)

    events = get_satellite_passes(satellites, t0, t1, lat, lon, visible_only)

    return Response(data={'data': events})

#################
# Page Templates
#################

def home(request: HttpRequest) -> HttpResponse:
    return render(request, 'satellites/list.html')

def settings(request: HttpRequest) -> HttpResponse:

    if request.method == 'POST':
            form = SettingsForm(request.POST)
            if form.is_valid():
                request.session['lat'] = form.cleaned_data['lat']
                request.session['lon'] = form.cleaned_data['lon']

    else:
        form = SettingsForm({
            'lat': request.session.get('lat', None),
            'lon': request.session.get('lon', None),
            })

    return render(request, 'satellites/settings.html', {'form': form})

def detail(request: HttpRequest, id: str) -> HttpResponse:

    visible_only = request.GET.get('visible_only', 'false') == 'true'

    satellite = get_satellite(id, 'NORAD')

    t0 = datetime.utcnow().replace(tzinfo=timezone.utc)
    t1 = t0 + timedelta(days=20)

    return render(request, 'satellites/detail.html',
                  context={'satellite': satellite,
                           'visible_only': visible_only,
                           't0': t0,
                           't1': t1})

def predictions(request: HttpRequest) -> HttpResponse:

    visible_only = request.GET.get('visible_only', 'false') == 'true'

    return render(request, 'satellites/predictions.html',
                  context={'visible_only': visible_only })

def pass_timeline(request: HttpRequest, id: str) -> HttpResponse:

    satellite = get_satellite(id, 'NORAD')

    t0 = parser.parse(request.GET.get('start'))
    t1 = parser.parse(request.GET.get('end'))
    
    return render(request, 'satellites/pass.html',
                  context={'satellite': satellite,
                           'start': t0,
                           'end': t1})
