import { Nav, Navbar, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'
import { useSettings } from './Settings';
import logo from './satellite.svg';

const Header = () => {

  const { initialValues } = useSettings();

  return (
    <Navbar expand="md">
      <Container>
        <Navbar.Brand>
          <object type="image/svg+xml"
          title="Logo"
          data={logo}
          role="img" width="30" height="24"></object>
          {' '}
          SkyTrack
        </Navbar.Brand>

      <Navbar.Toggle />

      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <LinkContainer exact="true" to="/">
            <Nav.Link>Home</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/constellations">
            <Nav.Link>Constellations</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/settings">
            <Nav.Link>Settings</Nav.Link>
          </LinkContainer>
        </Nav>

        <Navbar.Text>
          lat: { initialValues.latitude.toFixed(2) } N / lon: { initialValues.longitude.toFixed(2) } E
        </Navbar.Text>
      </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header;
