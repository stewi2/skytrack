from skyfield.api import load, wgs84
from skyfield import almanac, framelib
from skyfield.api import EarthSatellite
from skyfield.units import AngleRate
from datetime import datetime
import math
import pytz

stations_url = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle'
#stations_url = 'https://www.celestrak.com/NORAD/elements/supplemental/starlink.txt'
satellites = load.tle_file(stations_url)
print('Loaded', len(satellites), 'satellites')

satellites_by_id = {sat.model.satnum: sat for sat in satellites}

eph = load('de421.bsp')
ts = load.timescale()

coords = wgs84.latlon(35.807185453343514, -78.6761513684278)

tz = pytz.timezone('America/New_York')

def event_data(t, event, satellite, eph, difference, tod):
    name = ('rise', 'peak', 'set')[event]
    topocentric = difference.at(t)
    alt, az, _ = topocentric.altaz()
    ra, dec, _ = topocentric.radec()

    return {
        'timestamp': t.utc_datetime(),
        'event': name,
        'alt': alt.degrees,
        'az': az.degrees,
        'ra': str(ra),
        'dec': str(dec),
        'ra_deg': ra._degrees,
        'dec_deg': dec._degrees,
        'is_sunlit': bool(satellite.at(t).is_sunlit(eph)),
        'is_dark': bool(tod(t).item(0)<=3),
        'time_of_day': almanac.TWILIGHTS[tod(t).item(0)]
    }

def get_all_satellites() -> list[EarthSatellite]:
    return satellites

def get_satellite(sat_id: str) -> EarthSatellite:
    return satellites_by_id[sat_id]

def get_satellite_passes(sat_ids: list[str], t0: datetime, t1: datetime, visible_only: bool = True) -> list[dict]:

    tod = almanac.dark_twilight_day(eph, coords)

    t0 = ts.from_datetime(t0)
    t1 = ts.from_datetime(t1)

    passes = []

    for sat_id in sat_ids:

        satellite = satellites_by_id[sat_id]
        difference = satellite - coords

        t, events = satellite.find_events(coords, t0, t1, altitude_degrees=30.0)

        curr = None
        for event in [event_data(t,event,satellite,eph,difference,tod) for t, event in zip(t, events)]:
            if event['event']=='rise':
                curr = {'rise': event}
            elif event['event']=='peak' and curr:
                curr['peak'] = event
            elif event['event']=='set'and curr and 'peak' in curr :
                curr['set'] = event
                curr['is_visible'] = curr['peak']['is_sunlit'] and curr['peak']['is_dark']
                curr['satellite'] = {
                    'id': satellite.model.satnum,
                    'name': satellite.name
                }
                if not visible_only or curr['is_visible']:
                    passes.append(curr)
        
        print(satellite.name)
    passes.sort(key = lambda p: p['peak']['timestamp'])

    return passes

def get_pass_timeline(sat_id: str, t0: datetime, t1: datetime, steps: int = 100) -> list[dict]:

    satellite = satellites_by_id[sat_id]

    x = ts.linspace(ts.from_datetime(t0), ts.from_datetime(t1), steps)

    timeline = []

    for t in x:
        alt, az, distance, alt_rate, az_rate, range_rate = (satellite - coords).at(t).frame_latlon_and_rates(coords)
        _, _, _, dec_rate, ra_rate, _ = (satellite - coords).at(t).frame_latlon_and_rates(framelib.true_equator_and_equinox_of_date)
        ra, dec, _ = (satellite - coords).at(t).radec()
        is_sunlit = (satellite - coords).at(t).is_sunlit(eph)
        angular_rate = AngleRate._from_radians_per_day(math.sqrt(alt_rate.radians.per_day**2 + az_rate.radians.per_day**2)) 

        timeline.append({
            'timestamp': t.utc_datetime(),
            'alt': alt.degrees,
            'az': az.degrees,
            'ra': str(ra),
            'dec': str(dec),
            'ra_deg': ra._degrees,
            'dec_deg': dec._degrees,
            'distance': distance.km,
            'alt_rate': alt_rate.arcminutes.per_second,
            'az_rate': az_rate.arcminutes.per_second,
            'range_rate': range_rate.km_per_s,
            'is_sunlit': bool(is_sunlit),
            'angular_rate': angular_rate.arcminutes.per_second
        })

    return timeline