import axios from './axiosConfig';
import { useLoaderData, useParams } from 'react-router-dom';
import DetailTable from './DetailTable';

function detailLoader({ params }) {
  const initialValues = JSON.parse(localStorage.getItem('settings')) || {
    latitude: 0,
    longitude: 0,
    altitude: 0,
  };

  return axios.get(
    `/api/satellites/${params.satid}/passes`,{ params: {
      lat: initialValues.latitude,
      lon: initialValues.longitude,
      alt: initialValues.altitude,
      threshold: initialValues.threshold,
      visible_only: false}
    }
  ).then((res) => res.data);
}

const Detail = () => {
  let { satid } = useParams();
  const data = useLoaderData();
  return (
    <>
      <h5>{data.satellite.name} ({data.satellite.id})</h5>
      <DetailTable data={data.data} satid={satid} />
    </>
  )
}

export { detailLoader, Detail };
export default Detail;