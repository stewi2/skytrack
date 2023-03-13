from skyfield.api import wgs84
from skyfield import almanac, framelib
from skyfield.api import EarthSatellite, Loader
from skyfield.units import AngleRate
from datetime import datetime

import math
import logging

stations_urls = [
    ('NORAD',            'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle'),
    ('Starlink',         'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=starlink&FORMAT=tle'),
    ('OneWeb',           'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=oneweb&FORMAT=tle'),
    ('Planet',           'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=planet&FORMAT=tle'),
    ('Iridium',          'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=iridium&FORMAT=tle'),
    ('GPS',              'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=gps&FORMAT=tle'),
    ('GLONASS',          'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=glonass&FORMAT=tle'),
    ('Meteosat',         'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=meteosat&FORMAT=tle'),
    ('Intelsat',         'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=intelsat&FORMAT=tle'),
    ('SES',              'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=ses&FORMAT=tle'),
    ('Telesat',          'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=telesat&FORMAT=tle'),
    ('Orbcomm',          'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=orbcomm&FORMAT=tle'),
    ('ISS',              'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=iss&FORMAT=tle'),
    ('AST Space Mobile', 'https://celestrak.org/NORAD/elements/supplemental/sup-gp.php?FILE=ast&FORMAT=tle')
]

logger = logging.getLogger(__name__)

loader = Loader('.data', verbose=False)
eph = loader('de421.bsp')

ts = loader.timescale()

satellites = {}
satellites_by_id = {}

def update_tle():
    for group, url in stations_urls:
        filename = group + ".txt"
        if group not in satellites:
            if not loader._exists(filename) or loader.days_old(filename) > 1:
                logger.info(f"Downloading latest TLEs for {group} from {url}")
                satellites[group] = loader.tle_file(url, reload=True, filename=filename)
            else:
                satellites[group] = loader.tle_file(url, reload=False, filename=filename)

            satellites_by_id[group] = {sat.model.satnum: sat for sat in satellites[group]}

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

def get_all_groups() -> list[str]:
    update_tle()
    return satellites.keys()

def get_all_satellites(group: str) -> list[EarthSatellite]:
    update_tle()
    if group not in satellites:
        raise ValueError(f"Unknown group {group}")
    
    return satellites[group]

def get_satellite(sat_id: str, group: str) -> EarthSatellite:
    update_tle()
    return satellites_by_id[group][sat_id]

def get_satellite_passes(satellites, start: datetime, end: datetime, lat:float , lon:float, visible_only: bool = True) -> list[dict]:

    logger.info(f"Getting satellite passes: start={start.isoformat()} end={end.isoformat()} lat={lat} lon={lon} visible_only={visible_only}");

    update_tle()

    coords = wgs84.latlon(lat, lon)

    tod = almanac.dark_twilight_day(eph, coords)

    t0 = ts.from_datetime(start)
    t1 = ts.from_datetime(end)

    passes = []

    for satellite in satellites:

        difference = satellite - coords

        t, events = satellite.find_events(coords, t0, t1, altitude_degrees=30.0)

        curr = None
        for event in [event_data(t,event,satellite,eph,difference,tod) for t, event in zip(t, events)]:
            if event['event']=='rise':
                curr = {'rise': event}
            elif event['event']=='peak' and curr:
                curr['peak'] = event
            elif event['event']=='set' and curr and 'peak' in curr :
                curr['set'] = event
                curr['is_visible'] = curr['peak']['is_sunlit'] and curr['peak']['is_dark']
                curr['satellite'] = {
                    'id': satellite.model.satnum,
                    'name': satellite.name
                }
                if not visible_only or curr['is_visible']:
                    passes.append(curr)
        
        logger.debug(f"Processed {satellite.name} ({satellite.model.satnum})")
    
    passes.sort(key = lambda p: p['peak']['timestamp'])

    logger.info(f"Got {len(passes)} satellite passes: sttart={start.isoformat()} to={end.isoformat()} lat={lat} lon={lon} visible_only={visible_only}");

    return passes

def get_pass_timeline(satellite: EarthSatellite, t0: datetime, t1: datetime, lat:float, lon:float, steps: int = 100) -> list[dict]:

    coords = wgs84.latlon(lat, lon)

    update_tle()

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
