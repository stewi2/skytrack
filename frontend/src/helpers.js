import telescope from './telescope.svg'
import parabola from './parabola.svg'
import crystalball from './crystal-ball-future.svg'

function UnistellarLink({ra_deg, dec_deg, timestamp}) {
  let uri = new URL('unistellar://science/occultation')
  uri.search = new URLSearchParams({
    'ra': ra_deg,
    'dec': dec_deg,
    'et': 15,
    'g': 5,
    'd': 68,
    't': Math.floor(new Date(timestamp).getTime()/1000),
    'scitag': 'Satellites'
  });

  return (
    <a href={uri}>
      <img src={telescope} width="16" height="16" alt="telescope" />
    </a>
  )
}

function PredictionsLink({id}) {
  let url = new URL('/detail/'+id, window.location)
  return <a href={url}><img src={crystalball} width="16" height="16" alt="crystal ball" /></a>  
}

function PassDetailLink({id, t0, t1, settings}) {
  let url = new URL(`/pass/${id}/${Math.floor(new Date(t0).getTime()/1000)}-${Math.round(new Date(t1).getTime()/1000)}`, window.location)
  return <a href={url}><img src={parabola} width="16" height="16" alt="parabola" /></a>
}

export {PassDetailLink, UnistellarLink, PredictionsLink};