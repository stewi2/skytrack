import React, { useState, createContext, useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Form as BootstrapForm, Spinner, Stack } from 'react-bootstrap';

const SettingsContext = createContext();

function SettingsProvider(props) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initialValues = JSON.parse(localStorage.getItem('settings')) || {
    latitude: 0,
    longitude: 0,
    altitude: 0,
    threshold: 20,
  };

  const validationSchema = Yup.object().shape({
    latitude: Yup.number()
      .min(-90, 'Latitude must be greater than or equal to -90')
      .max(90, 'Latitude must be less than or equal to 90')
      .required('Latitude is required'),
    longitude: Yup.number()
      .min(-180, 'Longitude must be greater than or equal to -180')
      .max(180, 'Longitude must be less than or equal to 180')
      .required('Longitude is required'),
    altitude: Yup.number()
      .required('Altitude is required'),
    threshold: Yup.number()
      .required('Altitude threshold is required'),

  });

  const handleSubmit = (values, { setSubmitting }) => {
    localStorage.setItem('settings', JSON.stringify(values));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setSubmitting(false);
  };

  const handleGetLocation = (setFieldValue) => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFieldValue('latitude', Math.round(10000*position.coords.latitude)/10000);
        setFieldValue('longitude', Math.round(10000*position.coords.longitude)/10000);
        setFieldValue('altitude', Math.round(10*position.coords.altitude)/10 || 0);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <SettingsContext.Provider
      value={{ initialValues, validationSchema, handleSubmit, handleGetLocation, isSaved, isLoading }}
      {...props}
    />
  );
}

function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

function Settings() {
  const { initialValues, validationSchema, handleSubmit, handleGetLocation, isSaved, isLoading } = useSettings();

  return (
    <>
    <h5 align="center">Settings</h5>
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
      {({ isSubmitting, setFieldValue }) => (
        <Form>
        <Stack gap={3}>
          <BootstrapForm.Group>
            <BootstrapForm.Label>Latitude (N)</BootstrapForm.Label>
            <Field as={BootstrapForm.Control} type="number" name="latitude" />
            <ErrorMessage name="latitude" component="div" style={{ color: 'red' }} />
          </BootstrapForm.Group>
          <BootstrapForm.Group>
            <BootstrapForm.Label>Longitude (E)</BootstrapForm.Label>
            <Field as={BootstrapForm.Control} type="number" name="longitude" />
            <ErrorMessage name="longitude" component="div" style={{ color: 'red' }} />
          </BootstrapForm.Group>
          <BootstrapForm.Group>
            <BootstrapForm.Label>Altitude [m]</BootstrapForm.Label>
            <Field as={BootstrapForm.Control} type="number" name="altitude" />
            <ErrorMessage name="altitude" component="div" style={{ color: 'red' }} />
          </BootstrapForm.Group>
          <BootstrapForm.Group>
            <BootstrapForm.Label>Min Transit Altitude [deg]</BootstrapForm.Label>
            <Field as={BootstrapForm.Control} type="number" name="threshold" />
            <ErrorMessage name="threshold" component="div" style={{ color: 'red' }} />
          </BootstrapForm.Group>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Save'}
          </Button>
          <Button variant="secondary" onClick={() => handleGetLocation(setFieldValue)} disabled={isLoading}>
            {isLoading ? <><Spinner animation="border" size="sm" /> Locating...</>: 'Get Location'}
          </Button>
          {isSaved && <div style={{ color: 'green' }}>Saved!</div>}
        </Stack>
        </Form>
      )}
    </Formik>
    </>
  );
}

export { SettingsProvider, useSettings, Settings, SettingsContext };
