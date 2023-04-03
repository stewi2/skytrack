import { Formik, Form, Field } from 'formik';
import { Button, Form as BootstrapForm, Spinner } from 'react-bootstrap';
import { DateTime } from 'luxon';

const PredictionsForm = ({ handleSubmit, isFetching }) => {

  const initialValues = {
    start: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
    duration: 15,
    group: 'Starlink',
    visible_only: true,
  }

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ values, setFieldValue }) => (
        <Form>
            <BootstrapForm.Group>
              <BootstrapForm.Label htmlFor="start-time">Start (Local Time)</BootstrapForm.Label>
              <Field as={BootstrapForm.Control}
                name="start"
                type="datetime-local"
                step="any"
                id="start-time" />
            </BootstrapForm.Group>

            <BootstrapForm.Group>
              <BootstrapForm.Label htmlFor="duration">Duration</BootstrapForm.Label>
              <Field as={BootstrapForm.Select} name="duration">
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </Field>
            </BootstrapForm.Group>

            <BootstrapForm.Group>
              <BootstrapForm.Label htmlFor="constellation">Satellite Constellation</BootstrapForm.Label>
              <Field as={BootstrapForm.Select} name="group">
                <option>Starlink</option>
                <option>OneWeb</option>
                <option>Planet</option>
                <option>Iridium</option>
                <option>GPS</option>
                <option>GLONASS</option>
                <option>Meteosat</option>
                <option>Intelsat</option>
                <option>SES</option>
                <option>Telesat</option>
                <option>Orbcomm</option>
                <option>ISS</option>
                <option>AST Space Mobile</option>
              </Field>
            </BootstrapForm.Group>

            <BootstrapForm.Group>
              <Field as={BootstrapForm.Check}
                      name="visible_only" label="Visible Only"
                      checked={values.visible_only}
                      onChange={e => setFieldValue('visible_only', e.target.checked)} />
            </BootstrapForm.Group>

            <BootstrapForm.Group>
              <Button type="submit" variant="primary" disabled={isFetching}>
                {isFetching ? <Spinner animation="border" size="sm" />: 'Go'}
              </Button>
            </BootstrapForm.Group>
        </Form>
      )}
    </Formik>
  );
};

export default PredictionsForm;