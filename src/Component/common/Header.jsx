import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faStore,
  faUser,
  faSearch,
  faBars,
  faShoppingCart,
  faTruck,
  faClose,
  faSignOutAlt,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isIconMenuOpen, setIsIconMenuOpen] = useState(false);
  const [showCategoryNav, setShowCategoryNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const categories = [
    { to: "/Mobile", label: "Mobiles" },
    { to: "/Tv", label: "Electronics" },
    { to: "/Laptop", label: "Laptops" },
    { to: "/Books", label: "Books & Media" },
    { to: "/Fashion", label: "Fashion" },
    { to: "/Computer", label: "Computers" },
    { to: "/Electronic", label: "Appliances" },
    { to: "#", label: "Become a Seller" },
  ];

  // Check for login cookies/tokens
  const checkLoginStatus = () => {
    const authToken = document.cookie.split(';').find(cookie => 
      cookie.trim().startsWith('authToken=') || 
      cookie.trim().startsWith('token=') ||
      cookie.trim().startsWith('jwt=') ||
      cookie.trim().startsWith('userToken=')
    );
    
    const localToken = localStorage.getItem('authToken') || 
                     localStorage.getItem('token') || 
                     localStorage.getItem('jwt') ||
                     localStorage.getItem('userToken');
    
    return !!(authToken || localToken);
  };

  // Handle logout
  const handleLogout = () => {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    
    sessionStorage.clear();
    setIsLoggedIn(false);
    navigate('/Login');
  };

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const iconLinks = [
    { to: "/customer/cart", icon: faShoppingCart, title: "Cart", badge: "0" },
    { to: "/customer/myorders", icon: faTruck, title: "Orders" },
    { to: "/", icon: faHouse, title: "Home" },
    { to: "/seller/BussinessRegister", icon: faStore, title: "Sell" },
    ...(isLoggedIn ? 
      [{ action: handleLogout, icon: faSignOutAlt, title: "Logout" }] : 
      [{ to: "/Login", icon: faUser, title: "Login" }]
    ),
  ];

  useEffect(() => {
    const checkStatus = () => {
      setIsLoggedIn(checkLoginStatus());
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowCategoryNav(currentScrollY <= lastScrollY || currentScrollY < 70);
      setLastScrollY(currentScrollY);

      if (isIconMenuOpen && currentScrollY > lastScrollY) {
        setIsIconMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isIconMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      if (showSidebar && sidebar && !sidebar.contains(event.target) && 
          !event.target.classList.contains("sidebar-toggle")) {
        setShowSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSidebar]);

  return (
    <>
      {/* Top Header - Desktop & Mobile */}
      <header
        className="navbar navbar-expand-lg fixed-top shadow-sm"
        style={{
          zIndex: 1000,
          backgroundColor: "#2874f0",
          minHeight: "64px",
          padding: "8px 0",
        }}
      >
        <div className="container-fluid px-2 px-md-3">
          {/* Mobile Layout */}
          <div className="d-flex d-lg-none align-items-center justify-content-between w-100">
            {/* Left: Hamburger Menu */}
            <button 
              className="btn text-white p-2 sidebar-toggle"
              onClick={() => setShowSidebar(!showSidebar)}
              style={{ fontSize: "20px" }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            {/* Center: Logo */}
            <Link to="/" className="navbar-brand mx-auto">
              <img
                src="https://digitalstore.blr1.cdn.digitaloceanspaces.com/main.png"
                alt="Logo"
                style={{ height: "32px" }}
              />
            </Link>

            {/* Right: Cart & Login */}
            <div className="d-flex align-items-center">
              <Link to="/customer/cart" className="text-white me-2 position-relative">
                <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{ fontSize: "10px" }}>
                  3
                </span>
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="btn text-white p-2"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
                </button>
              ) : (
                <Link to="/Login" className="text-white">
                  <FontAwesomeIcon icon={faUser} size="lg" />
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="d-none d-lg-flex align-items-center justify-content-between w-100">
            {/* Left Section: Logo + Location */}
            <div className="d-flex align-items-center me-4">
              <Link to="/" className="navbar-brand me-4">
                <img
                  src="https://digitalstore.blr1.cdn.digitaloceanspaces.com/main.png"
                  alt="Logo"
                  style={{ height: "40px" }}
                />
              </Link>
              
              {/* Location Indicator */}
              <div className="text-white me-3" style={{ fontSize: "14px" }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" />
                <span className="text-white-50">Deliver to</span>
                <br />
                <strong>Jaipur 302001</strong>
              </div>
            </div>

            {/* Center: Search Bar - Takes most space */}
            <div className="flex-grow-1 mx-4" style={{ maxWidth: "600px", minWidth: "300px" }}>
              <form onSubmit={handleSearch}>
                <div className="input-group shadow-sm">
                  <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Search for products, brands and more"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      fontSize: "16px",
                      padding: "12px 16px",
                      backgroundColor: "#fff",
                    }}
                  />
                  <button
                    type="submit"
                    className="btn text-primary"
                    style={{ 
                      backgroundColor: "#fff",
                      border: "none",
                      borderLeft: "1px solid #dee2e6",
                      padding: "0 20px"
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} size="lg" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Section: User Actions */}
            <div className="d-flex align-items-center">
              {/* Login/Account */}
              {isLoggedIn ? (
                <div className="dropdown me-4">
                  <button className="btn text-white dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Account
                  </button>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                    <li><Link className="dropdown-item" to="/customer/myorders">Orders</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/Login" className="btn text-white me-4 d-flex align-items-center">
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Login
                </Link>
              )}

              {/* Become a Seller */}
              <Link to="/seller/BussinessRegister" className="text-white me-4 text-decoration-none">
                <FontAwesomeIcon icon={faStore} className="me-2" />
                Become a Seller
              </Link>

              {/* Orders */}
              <Link to="/customer/myorders" className="text-white me-4 text-decoration-none d-flex align-items-center">
                <FontAwesomeIcon icon={faTruck} className="me-2" />
                Orders
              </Link>

              {/* Cart with Badge */}
              <Link to="/customer/cart" className="text-white position-relative d-flex align-items-center text-decoration-none">
                <FontAwesomeIcon icon={faShoppingCart} className="me-2" size="lg" />
                Cart
                <span className="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-warning text-dark" style={{ fontSize: "10px" }}>
                  3
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div
        className="d-lg-none fixed-top bg-white border-bottom"
        style={{
          top: "64px",
          zIndex: 999,
          padding: "12px 16px",
        }}
      >
        <form onSubmit={handleSearch}>
          <div className="input-group">
            <input
              type="text"
              className="form-control border"
              placeholder="Search for products, brands and more"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                fontSize: "16px",
                padding: "12px 16px",
              }}
            />
            <button
              type="submit"
              className="btn btn-outline-primary"
              style={{ padding: "0 20px" }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </form>
      </div>

      {/* Category Navigation */}
      <nav
        className="navbar navbar-expand-lg bg-white shadow-sm d-none d-lg-block fixed-top"
        style={{
          top: "64px",
          zIndex: 900,
          padding: "8px 0",
          transition: "transform 0.3s ease-in-out",
          transform: showCategoryNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="container-fluid px-3">
          <ul className="navbar-nav d-flex flex-row w-100 justify-content-start">
            {categories.map(({ to, label }, index) => (
              <li key={index} className="nav-item me-4">
                <Link 
                  to={to} 
                  className="nav-link text-dark fw-medium px-0 py-2 position-relative"
                  style={{ 
                    fontSize: "16px",
                    textDecoration: "none",
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#2874f0"}
                  onMouseLeave={(e) => e.target.style.color = ""}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Category Navigation */}
      <nav
        className="d-lg-none fixed-top bg-white border-bottom"
        style={{
          top: "120px",
          zIndex: 900,
          padding: "12px 0",
          overflowX: "auto",
          transition: "transform 0.3s ease-in-out",
          transform: showCategoryNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="d-flex px-3" style={{ minWidth: "max-content" }}>
          {categories.map(({ to, label }, index) => (
            <Link
              key={index}
              to={to}
              className="btn btn-outline-primary me-2 flex-shrink-0"
              style={{ 
                whiteSpace: "nowrap",
                fontSize: "14px",
                padding: "6px 12px"
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`position-fixed bg-white shadow-lg ${showSidebar ? 'show' : ''}`}
        style={{
          top: 0,
          left: showSidebar ? 0 : '-320px',
          width: '320px',
          height: '100vh',
          zIndex: 1500,
          transition: 'left 0.3s ease-in-out',
          overflowY: 'auto',
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom bg-light">
          <div className="d-flex align-items-center">
            <FontAwesomeIcon icon={faUser} className="me-3 text-primary" size="lg" />
            <div>
              <h6 className="m-0 text-dark">Hello!</h6>
              <small className="text-muted">Sign up for best experience</small>
            </div>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowSidebar(false)}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>

        <div className="p-0">
          {/* Categories in sidebar */}
          <div className="border-bottom">
            <h6 className="text-dark px-4 py-3 mb-0 bg-light fw-bold border-bottom">
              <FontAwesomeIcon icon={faBars} className="me-2" />
              Shop by Category
            </h6>
            {categories.map(({ to, label }, index) => (
              <Link 
                key={index} 
                to={to} 
                className="d-block text-dark py-3 px-4 text-decoration-none border-bottom hover-bg"
                onClick={() => setShowSidebar(false)}
                style={{ 
                  fontSize: "16px",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                onMouseLeave={(e) => e.target.style.backgroundColor = ""}
              >
                {label}
              </Link>
            ))}
          </div>
          
          {/* Quick Actions */}
          <div>
            <h6 className="text-dark px-4 py-3 mb-0 bg-light fw-bold border-bottom">
              Quick Actions
            </h6>
            {iconLinks.filter(link => link.title !== "Home").map((link, index) => (
              <div key={index}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className="d-block text-dark py-3 px-4 text-decoration-none border-bottom position-relative"
                    onClick={() => setShowSidebar(false)}
                    style={{ 
                      fontSize: "16px",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = ""}
                  >
                    <FontAwesomeIcon icon={link.icon} className="me-3 text-primary" />
                    {link.title}
                    {link.badge && (
                      <span className="badge bg-warning text-dark ms-2">{link.badge}</span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      link.action();
                      setShowSidebar(false);
                    }}
                    className="d-block text-dark py-3 px-4 text-decoration-none border-bottom btn border-0 bg-transparent text-start w-100"
                    style={{ 
                      fontSize: "16px",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = ""}
                  >
                    <FontAwesomeIcon icon={link.icon} className="me-3 text-primary" />
                    {link.title}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {showSidebar && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1400,
          }}
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Spacers for content positioning */}
      <div className="d-lg-none" style={{ height: "172px" }}></div>
      <div className="d-none d-lg-block" style={{ height: "112px" }}></div>
    </>
  );
}

export default Header;
