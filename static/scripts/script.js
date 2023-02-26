function generate_unistellar_uri(ra, dec, timestamp) {
  uri = new URL('unistellar://science/occultation')
  uri.search = new URLSearchParams({
    'ra': ra,
    'dec': dec,
    'et': 15,
    'g': 5,
    'd': 68,
    't': Math.floor(timestamp.getTime()/1000),
    'scitag': 'Satellites'
  });

  return uri;
}

function generate_detail_url(id, t0, t1) {
  let detailUrl = new URL('/pass/'+id, window.location)
  detailUrl.search = new URLSearchParams({
    'start': t0,
    'end': t1
  })
 
  return detailUrl;
}