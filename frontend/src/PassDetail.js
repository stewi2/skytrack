import axios from './axiosConfig';
import { useLoaderData, useParams } from 'react-router-dom';
import PassDetailTable from './PassDetailTable';

function passDetailLoader({ params }) {
  const initialValues = JSON.parse(localStorage.getItem('settings')) || {
    latitude: 0,
    longitude: 0,
    altitude: 0,
  };

  return axios.get(
    `/api/satellites/${params.satid}/passes/${params.range}`, { params: {
      lat: initialValues.latitude,
      lon: initialValues.longitude,
      alt: initialValues.altitude,
      threshold: initialValues.threshold,
    }}
  ).then((res) => res.data);
}

const PassDetail = () => {
  const data = useLoaderData();
  const params = useParams();
  const range = params.range.split('-');

  return (
    <>
      <h5 align="center">{data.satellite.name} ({data.satellite.id})</h5>
      <p align="center">Pass at {new Date(range[0]*1000).toLocaleString()}</p>

      <PassDetailTable data={data.data} />
    </>
  )
}

export { passDetailLoader, PassDetail };
export default PassDetail;