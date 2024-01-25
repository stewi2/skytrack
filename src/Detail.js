import axios from './axiosConfig';
import { useLoaderData, useParams } from 'react-router-dom';
import DetailTable from './DetailTable';

function detailLoader({ params }) {
  const initialValues = JSON.parse(localStorage.getItem('settings')) || {
    latitude: 0,
    longitude: 0,
    altitude: 0,
    threshold: 20,
  };

  return axios.get(
    `/api/passes`,{ params: {
      id: params.satid,
      lat: initialValues.latitude,
      lon: initialValues.longitude,
      alt: initialValues.altitude,
      threshold: initialValues.threshold,
      visible_only: true}
    }
  ).then((res) => res.data);
}

const Detail = () => {
  let { satid } = useParams();
  const data = useLoaderData();
  return (
    <>
      <h5 align="center">{data.satellite.name} ({data.satellite.id})</h5>
      <p align="center">Visible passes for the next 20 days.</p>

      <DetailTable data={data.data} satid={satid} />
    </>
  )
}

export { detailLoader, Detail };
export default Detail;