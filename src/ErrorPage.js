import { useRouteError } from "react-router-dom";
import { Alert } from "react-bootstrap";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <Alert variant="light">
      <Alert.Heading>Error</Alert.Heading>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </Alert>
  );
}