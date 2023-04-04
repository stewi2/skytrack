import SatellitesListTable from './SatellitesListTable.js'
import axios from './axiosConfig';
import { useLoaderData } from 'react-router-dom';

function satellitesLoader() {
  return axios.get('/api/satellites').then((res) => res.data);
}

const Satellites = () => {
  const data = useLoaderData();
  return (
    <>
      <h5 align="center">Active Satellites</h5>
      <SatellitesListTable data={data.data} />
    </>
  )
}

export { satellitesLoader, Satellites };
export default Satellites;