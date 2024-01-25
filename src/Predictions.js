import { useState } from 'react';
import { useQuery } from 'react-query';
import axios from './axiosConfig';
import PredictionsForm from './PredictionsForm';
import PredictionsTable from './PredictionsTable';
import { useSettings } from './Settings';
import { DateTime } from 'luxon';

const Predictions = () => {

  const { initialValues } = useSettings();
  const [ params, setParams ] = useState();

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: [params],
    queryFn: () => axios.get(
      '/api/predictions', {
        params: params,
      }).then((res) => res.data),
    staleTime: Infinity,
    refetchOnMount: false,
    enabled: !!params,
  });

  const handleSubmit = (values) => {
    setParams({
      start: Math.floor(DateTime.fromISO(values.start).ts/1000),
      group: values.group,
      duration: values.duration,
      visible_only: values.visible_only,
      lat: initialValues.latitude,
      lon: initialValues.longitude,
      alt: initialValues.altitude,
      threshold: initialValues.threshold,
    });
  };

  return (
    <>
      <h5 align="center">Satellite Constellation Pass Predictions</h5>

      <PredictionsForm handleSubmit={handleSubmit} isFetching={isFetching} />

      <hr />

      {isError && <p>Error fetching data</p>}
      {isSuccess && <PredictionsTable data={data.data} />}
    </>
  )
}

export default Predictions;