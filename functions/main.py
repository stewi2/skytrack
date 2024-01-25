from datetime import datetime, timezone, timedelta

from firebase_functions.https_fn import on_request, Request, Response
from firebase_functions.scheduler_fn import on_schedule, ScheduledEvent, Timezone
from firebase_admin import initialize_app

from utils import get_all_satellites, get_pass_timeline, get_satellite, get_satellite_passes, get_all_groups
from flask import jsonify

from skyfield.sgp4lib import EarthSatellite

from tle import download_tle_data

initialize_app()

def satellite_to_dict(sat: EarthSatellite) -> dict:
    return {'id': sat.model.satnum,
            'name': sat.name,
            'epoch': sat.epoch.utc_datetime()}

@on_request()
def groups(request: Request) -> Response:
    return jsonify({'data': [g for g in get_all_groups() if g!='NORAD']})

@on_request()
def satellites(request: Request) -> Response:
    result = list(map(satellite_to_dict, get_all_satellites('NORAD')))
    return jsonify({'data': result})

@on_request()
def passes(request: Request) -> Response:
    id = int(request.args.get('id'))
    visible_only = request.args.get('visible_only', 'true') == 'true'
    lat = float(request.args.get('lat'))
    lon = float(request.args.get('lon'))
    alt = float(request.args.get('alt'))
    threshold = float(request.args.get('threshold'))

    satellite = get_satellite(id, 'NORAD')

    t0 = datetime.utcnow().replace(tzinfo=timezone.utc)
    t1 = t0 + timedelta(days=20)

    events = get_satellite_passes([satellite], t0, t1, lat, lon, alt, threshold, visible_only)

    sat = {'id': satellite.model.satnum,
           'name': satellite.name,
          'epoch': satellite.epoch.utc_datetime()}

    return jsonify({'satellite': sat, 'data': events})

@on_request()
def pass_details(request: Request) -> Response:

    id = int(request.args.get('id'))
    start = int(request.args.get('start'))
    end = int(request.args.get('end'))
    lat = float(request.args.get('lat'))
    lon = float(request.args.get('lon'))
    alt = float(request.args.get('alt'))

    satellite = get_satellite(id, 'NORAD')

    t0 = datetime.utcfromtimestamp(start).replace(tzinfo=timezone.utc)
    t1 = datetime.utcfromtimestamp(end).replace(tzinfo=timezone.utc)

    timeline = get_pass_timeline(satellite, t0, t1, lat, lon, alt, steps=50)

    return jsonify({'satellite': satellite_to_dict(satellite), 'data': timeline})

@on_request()
def predictions(request: Request) -> Response:
    visible_only = request.args.get('visible_only', 'false') == 'true'
    lat = float(request.args.get('lat'))
    lon = float(request.args.get('lon'))
    alt = float(request.args.get('alt'))
    group = request.args.get('group', 'Starlink')
    start = request.args.get('start', str(datetime.utcnow().timestamp()))
    duration = int(request.args.get('duration', '60'))
    threshold = float(request.args.get('threshold', '20'))

    t0 = datetime.fromtimestamp(int(start), tz=timezone.utc)
    t1 = t0 + timedelta(minutes=duration)

    satellites = get_all_satellites(group)

    events = get_satellite_passes(satellites, t0, t1, lat, lon, alt, threshold, visible_only)

    return jsonify({'data': events})

@on_schedule(
    schedule="* * * * *",
    timezone=Timezone("UTC"),
)
def download_tle(event: ScheduledEvent) -> None:
    download_tle_data()