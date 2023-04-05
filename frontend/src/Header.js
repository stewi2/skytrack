import { Nav, Navbar, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap'
import { NavLink } from 'react-router-dom';
import { useSettings } from './Settings';
import logo from './satellite.svg';

const Header = () => {

  const { initialValues } = useSettings();

  return (
    <Navbar bg="light" expand="md">
      <Container>
        <Navbar.Brand>
          <img src={logo}
            width="30" height="24" alt="logo"
            className="d-inline-block align-text-top" />
          {' '}
          SkyTrack
        </Navbar.Brand>

      <Navbar.Toggle />

      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <LinkContainer to="/satellites">
            <Nav.Link>Satellites</Nav.Link>
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
