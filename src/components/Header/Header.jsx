import React, { useRef, useContext } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Link, NavLink } from 'react-router-dom';
import { UserContext } from '../../UserContext';
import '../../styles/header.css';

const navLinks = [
  { path: '/home', display: 'Home' },
  { path: '/about', display: 'About' },
  { path: '/cars', display: 'Cars' },
  { path: '/contact', display: 'Contact' },
];

const Header = () => {
  const menuRef = useRef(null);
  const { user, logout } = useContext(UserContext);
  const toggleMenu = () => menuRef.current.classList.toggle('menu__active');

  return (
    <header className="header">
      <div className="header__middle">
        <Container>
          <Row>
            <Col lg="4" md="3" sm="4">
              <div className="logo">
                <h1>
                  <Link to="/home" className="d-flex align-items-center gap-2">
                    <i className="ri-car-line"></i>
                    <span>Manage <br /> Cars</span>
                  </Link>
                </h1>
              </div>
            </Col>
            <Col lg="4" md="3" sm="4" className="d-flex align-items-center justify-content-end">
              <button className="header__btn btn">
                <Link to="/contact">
                  <i className="ri-phone-line"></i> Request a call
                </Link>
              </button>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="main__navbar">
        <Container>
          <div className="navigation__wrapper d-flex align-items-center justify-content-between">
            <span className="mobile__menu">
              <i className="ri-menu-line" onClick={toggleMenu}></i>
            </span>

            <div className="navigation" ref={menuRef} onClick={toggleMenu}>
              <div className="menu">
                {navLinks.map((item, index) => (
                  <NavLink
                    to={item.path}
                    className={(navClass) =>
                      navClass.isActive ? 'nav__active nav__item' : 'nav__item'
                    }
                    key={index}
                  >
                    {item.display}
                  </NavLink>
                ))}
                {!user && (
                  <>
                    <NavLink to="/login" className="nav__item">Login</NavLink>
                    <NavLink to="/register" className="nav__item">Register</NavLink>
                  </>
                )}
                {user && (
                  <NavLink 
                  to="/"  
                  className="nav__item"
                  onClick={logout}  
                >
                  Logout
                </NavLink>
                )}
              </div>
            </div>

            <div className="nav__right">
              <div className="search__box">
                <input type="text" placeholder="Search" />
                <span>
                  <i className="ri-search-line"></i>
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
};

export default Header;
