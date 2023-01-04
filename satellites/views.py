from django.shortcuts import render

from skyfield.api import load, wgs84
from pytz import timezone

from datetime import datetime
from astropy.time import Time

stations_url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle'
satellites = load.tle_file(stations_url)
print('Loaded', len(satellites), 'satellites')

satellites_by_id = {sat.model.satnum: sat for sat in satellites}
eph = load('de421.bsp')

def event_data(t, event, satellite, eph, difference, tz):
    name = ('rise', 'peak', 'set')[event]
    topocentric = difference.at(t)
    alt, az, _ = topocentric.altaz()
    ra, dec, _ = topocentric.radec()

    return {
        'timestamp': t.astimezone(tz),
        'event': name,
        'alt': alt.degrees,
        'az': az.degrees,
        'ra': ra.hours,
        'dec': dec.degrees,
        'is_sunlit': bool(satellite.at(t).is_sunlit(eph))
    }

def home(request):
    return render(request, 'satellites/list.html', context={'satellites': satellites})

def detail(request, id):
    satellite = satellites_by_id[id]
    coords = wgs84.latlon(35.807185453343514, -78.6761513684278)
    difference = satellite - coords

    tz = timezone('US/Eastern')
    ts = load.timescale()

    t0 = ts.from_datetime(tz.localize(datetime.now()))
    t1 = t0 + 30

    t, events = satellite.find_events(coords, t0, t1, altitude_degrees=15.0)

    events = [event_data(t, event, satellite, eph, difference, tz) for t, event in zip(t, events)]

    return render(request, 'satellites/detail.html',
                  context={'satellite': satellite,
                           'events': events,
                           't0': t0.astimezone(tz),
                           't1': t1.astimezone(tz)})
