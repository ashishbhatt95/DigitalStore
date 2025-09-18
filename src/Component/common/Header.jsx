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
    { to: "/Mobile", label: "Mobile" },
    { to: "/Tv", label: "TV" },
    { to: "/Laptop", label: "Laptops" },
    { to: "/Books", label: "Books" },
    { to: "/Fashion", label: "Fashion" },
    { to: "/Computer", label: "Computer" },
    { to: "/Electronic", label: "Electronic" },
    { to: "#", label: "Sell" },
  ];

  // Check for login cookies/tokens
  const checkLoginStatus = () => {
    // Check for common cookie/token names - adjust these based on your app
    const authToken = document.cookie.split(';').find(cookie => 
      cookie.trim().startsWith('authToken=') || 
      cookie.trim().startsWith('token=') ||
      cookie.trim().startsWith('jwt=') ||
      cookie.trim().startsWith('userToken=')
    );
    
    // Also check localStorage for tokens if you use them
    const localToken = localStorage.getItem('authToken') || 
                     localStorage.getItem('token') || 
                     localStorage.getItem('jwt') ||
                     localStorage.getItem('userToken');
    
    return !!(authToken || localToken);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear all possible cookies
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      // Clear cookie by setting expiry date to past
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
    });
    
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Update login status
    setIsLoggedIn(false);
    
    // Redirect to login page
    navigate('/Login');
  };

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results page or implement search logic
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      // Reset search term after search
      setSearchTerm("");
    }
  };

  const iconLinks = [
    { to: "/customer/cart", icon: faShoppingCart, title: "Cart" },
    { to: "/customer/myorders", icon: faTruck, title: "My Orders" },
    { to: "/", icon: faHouse, title: "Home" },
    { to: "/seller/BussinessRegister", icon: faStore, title: "Seller" },
    ...(isLoggedIn ? 
      [{ action: handleLogout, icon: faSignOutAlt, title: "Logout" }] : 
      [{ to: "/Login", icon: faUser, title: "Login" }]
    ),
  ];

  useEffect(() => {
    // Check login status on component mount and periodically
    const checkStatus = () => {
      setIsLoggedIn(checkLoginStatus());
    };
    
    checkStatus();
    
    // Check every 5 seconds for cookie changes
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowCategoryNav(currentScrollY <= lastScrollY || currentScrollY < 70);
      setLastScrollY(currentScrollY);

      if (isIconMenuOpen && currentScrollY > lastScrollY) {
        setIsIconMenuOpen(false); // Auto close on scroll down
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isIconMenuOpen]);

  // Close sidebar when clicking outside
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
      {/* Top Navbar */}
      <nav
        className="navbar navbar-expand-lg fixed-top"
        style={{
          zIndex: 1000,
          backgroundImage:
            "linear-gradient(to right, rgb(85, 82, 82), black, rgb(206, 200, 200), black)",
          padding: "10px",
        }}
      >
        <div className="container-fluid">
          {/* Mobile View */}
          <div className="d-flex justify-content-between align-items-center w-100 d-lg-none">
            <Link to="/" className="navbar-brand">
              <img
                src="https://digitalstore.blr1.cdn.digitaloceanspaces.com/main.png"
                alt="Logo"
                style={{ height: "40px" }}
              />
            </Link>
          </div>

          {/* Desktop View */}
          <div className="d-none d-lg-flex justify-content-between align-items-center w-100">
            <Link to="/" className="navbar-brand me-3">
              <img
                src="https://digitalstore.blr1.cdn.digitaloceanspaces.com/main.png"
                alt="Logo"
                style={{ height: "50px" }}
              />
            </Link>

            {/* Desktop Search Form */}
            <div className="flex-grow-1 mx-4" style={{ maxWidth: "500px" }}>
              <form onSubmit={handleSearch} className="position-relative">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control rounded-pill pe-5"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      paddingRight: "50px",
                      border: "2px solid #dee2e6",
                      fontSize: "16px"
                    }}
                  />
                  <button
                    type="submit"
                    className="btn position-absolute end-0 top-50 translate-middle-y me-2"
                    style={{ 
                      background: "none", 
                      border: "none",
                      zIndex: 5,
                      color: "#6c757d"
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </form>
            </div>

            <ul className="navbar-nav d-flex flex-row ms-3">
              {iconLinks.map((link, index) => (
                <li key={index} className="nav-item mx-2">
                  {link.to ? (
                    <Link
                      to={link.to}
                      className={`nav-link text-white ${
                        location.pathname === link.to ? "fw-bold text-warning" : ""
                      }`}
                    >
                      <FontAwesomeIcon icon={link.icon} className="fa-lg" />
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className="nav-link text-white btn border-0 bg-transparent"
                      style={{ padding: "0.5rem" }}
                    >
                      <FontAwesomeIcon icon={link.icon} className="fa-lg" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div
        className="d-lg-none fixed-top"
        style={{
          top: "70px",
          zIndex: 999,
          backgroundImage:
            "linear-gradient(to right, rgb(85, 82, 82), black, rgb(206, 200, 200), black)",
          padding: "10px",
        }}
      >
        <div className="container-fluid">
          <form onSubmit={handleSearch} className="position-relative">
            <div className="input-group">
              <input
                type="text"
                className="form-control rounded-pill pe-5"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingRight: "50px",
                  border: "2px solid #dee2e6",
                  fontSize: "16px"
                }}
              />
              <button
                type="submit"
                className="btn position-absolute end-0 top-50 translate-middle-y me-2"
                style={{ 
                  background: "none", 
                  border: "none",
                  zIndex: 5,
                  color: "#6c757d"
                }}
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Icon Menu */}
      {isIconMenuOpen && (
        <div
          className="bg-dark rounded p-2 position-fixed d-lg-none"
          style={{
            top: "140px",
            right: "10px",
            zIndex: 1001,
          }}
        >
          {iconLinks.map((link, index) => (
            <div key={index}>
              {link.to ? (
                <Link
                  to={link.to}
                  className={`d-block text-white py-2 px-3 text-decoration-none ${
                    location.pathname === link.to ? "fw-bold text-warning" : ""
                  }`}
                  onClick={() => setIsIconMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={link.icon} className="me-2" />
                  {link.title}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    link.action();
                    setIsIconMenuOpen(false);
                  }}
                  className="d-block text-white py-2 px-3 btn border-0 bg-transparent text-start w-100"
                >
                  <FontAwesomeIcon icon={link.icon} className="me-2" />
                  {link.title}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Desktop Category Nav with Toggle Button */}
      <nav
        className="navbar navbar-expand-lg d-none d-lg-block fixed-top"
        style={{
          top: "80px",
          zIndex: 900,
          backgroundColor: "rgb(71, 114, 199)",
          padding: "10px",
          transition: "transform 0.3s ease-in-out",
          transform: showCategoryNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="container-fluid">
          <div className="d-flex justify-content-start align-items-center w-100">
            <button 
              className="btn btn-outline-light sidebar-toggle me-3"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <ul className="navbar-nav d-flex flex-row">
              {categories.map(({ to, label }, index) => (
                <li key={index} className="nav-item">
                  <Link 
                    to={to} 
                    className="nav-link text-white px-3 py-2"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Category Nav */}
      <nav
        className="navbar d-lg-none fixed-top"
        style={{
          top: "140px",
          zIndex: 900,
          backgroundColor: "rgb(71, 114, 199)",
          overflowX: "auto",
          padding: "10px",
          transition: "transform 0.3s ease-in-out",
          transform: showCategoryNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="container-fluid">
          <div className="d-flex justify-content-start align-items-center w-100">
            <button 
              className="btn btn-outline-light sidebar-toggle me-3"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div
              className="d-flex flex-nowrap overflow-auto"
              style={{ 
                scrollbarWidth: "none", 
                msOverflowStyle: "none",
                WebkitScrollbar: { display: "none" }
              }}
            >
              {categories.map(({ to, label }, index) => (
                <Link
                  key={index}
                  to={to}
                  className="btn btn-outline-light mx-1 flex-shrink-0"
                  style={{ whiteSpace: "nowrap" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`position-fixed bg-white ${showSidebar ? 'show' : ''}`}
        style={{
          top: 0,
          left: showSidebar ? 0 : '-300px',
          width: '300px',
          height: '100vh',
          zIndex: 1500,
          transition: 'left 0.3s ease-in-out',
          boxShadow: showSidebar ? '5px 0 15px rgba(0,0,0,0.2)' : 'none',
          overflowY: 'auto',
          paddingTop: '20px'
        }}
      >
        <div className="d-flex justify-content-between align-items-center px-4 mb-4">
          <h5 className="m-0 text-dark">Menu</h5>
          <button 
            className="btn btn-outline-dark"
            onClick={() => setShowSidebar(false)}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        <div className="px-4">
          {/* Categories in sidebar */}
          <h6 className="text-dark mb-3 fw-bold">Categories</h6>
          {categories.map(({ to, label }, index) => (
            <Link 
              key={index} 
              to={to} 
              className="d-block text-dark py-2 text-decoration-none border-bottom"
              onClick={() => setShowSidebar(false)}
            >
              {label}
            </Link>
          ))}
          
          {/* Icon links in sidebar */}
          <h6 className="text-dark mb-3 mt-4 fw-bold">Quick Links</h6>
          {iconLinks.map((link, index) => (
            <div key={index}>
              {link.to ? (
                <Link
                  to={link.to}
                  className="d-block text-dark py-2 text-decoration-none border-bottom"
                  onClick={() => setShowSidebar(false)}
                >
                  <FontAwesomeIcon icon={link.icon} className="me-3" />
                  {link.title}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    link.action();
                    setShowSidebar(false);
                  }}
                  className="d-block text-dark py-2 text-decoration-none border-bottom btn border-0 bg-transparent text-start w-100"
                >
                  <FontAwesomeIcon icon={link.icon} className="me-3" />
                  {link.title}
                </button>
              )}
            </div>
          ))}
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

      {/* Spacers for content below header */}
      <div className="d-lg-none" style={{ height: "210px" }}></div>
      <div className="d-none d-lg-block" style={{ height: "160px" }}></div>
    </>
  );
}

export default Header;
