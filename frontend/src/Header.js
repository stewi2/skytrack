import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { useSettings } from './Settings';
import logo from './satellite.svg';

const Header = () => {

  const { initialValues } = useSettings();

  return (
    <Navbar bg="light" expand="sm">
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
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/predictions">Constellations</Nav.Link>
          <Nav.Link href="/settings">Settings</Nav.Link>
        </Nav>
      </Navbar.Collapse>

      <Navbar.Collapse className="justify-content-end">
        <Navbar.Text>
          lat: { initialValues.latitude.toFixed(2) } / lon: { initialValues.longitude.toFixed(2) }
        </Navbar.Text>
      </Navbar.Collapse>
    </Navbar>
  )
}

export default Header;