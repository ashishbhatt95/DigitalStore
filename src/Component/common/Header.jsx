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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Add your search functionality here
      console.log("Searching for:", searchTerm);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav
        className="navbar navbar-expand-lg shadow-sm"
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
          backgroundImage:
            "linear-gradient(to right, rgb(85, 82, 82), black, rgb(206, 200, 200), black)",
          padding: "8px 0",
          minHeight: "70px"
        }}
      >
        <div className="container-fluid px-3">
          {/* Mobile View */}
          <div className="d-flex justify-content-between align-items-center w-100 d-lg-none">
            {/* Mobile Logo */}
            <Link to="/" className="navbar-brand">
              <img
                src="https://digitalstore.blr1.cdn.digitaloceanspaces.com/main.png"
                alt="Logo"
                style={{ height: "45px" }}
                className="img-fluid"
              />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="btn btn-outline-light d-lg-none"
              onClick={() => setIsIconMenuOpen(!isIconMenuOpen)}
              aria-label="Toggle navigation"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>

          {/* Desktop View */}
          <div className="d-none d-lg-flex justify-content-between align-items-center w-100">
            {/* Desktop Logo */}
            <Link to="/" className="navbar-brand me-4">
              <img
                src="https://digitalstore.blr1.cdn.digitaloceanspaces.com/main.png"
                alt="Logo"
                style={{ height: "50px" }}
                className="img-fluid"
              />
            </Link>

            {/* Desktop Search Bar */}
            <div className="flex-grow-1 mx-4" style={{ maxWidth: "600px" }}>
              <form onSubmit={handleSearch} className="position-relative">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control border-0 py-2 px-4"
                    placeholder="Search for products, brands and more..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "25px 0 0 25px",
                      fontSize: "14px",
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    style={{
                      borderRadius: "0 25px 25px 0",
                      backgroundColor: "#2874f0",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </form>
            </div>

            {/* Desktop Navigation Icons */}
            <div className="d-flex align-items-center">
              {iconLinks.map((link, index) => (
                <div key={index} className="mx-2">
                  {link.to ? (
                    <Link
                      to={link.to}
                      className={`btn btn-link text-white p-2 text-decoration-none d-flex flex-column align-items-center ${
                        location.pathname === link.to ? "text-warning" : ""
                      }`}
                      style={{ 
                        fontSize: "12px",
                        minWidth: "60px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <FontAwesomeIcon icon={link.icon} className="mb-1" size="lg" />
                      <span>{link.title}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className="btn btn-link text-white p-2 text-decoration-none d-flex flex-column align-items-center"
                      style={{ 
                        fontSize: "12px",
                        minWidth: "60px",
                        border: "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <FontAwesomeIcon icon={link.icon} className="mb-1" size="lg" />
                      <span>{link.title}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      <div
        className="d-lg-none"
        style={{
          position: "fixed",
          top: "70px",
          width: "100%",
          zIndex: 999,
          backgroundColor: "#fff",
          padding: "12px 15px",
          borderBottom: "1px solid #e0e0e0",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        <form onSubmit={handleSearch} className="position-relative">
          <div className="input-group">
            <input
              type="text"
              className="form-control border py-2 px-3"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: "20px 0 0 20px",
                fontSize: "14px",
                border: "1px solid #ddd"
              }}
            />
            <button
              type="submit"
              className="btn btn-primary px-3"
              style={{
                borderRadius: "0 20px 20px 0",
                backgroundColor: "#2874f0",
                border: "1px solid #2874f0"
              }}
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Icon Menu */}
      {isIconMenuOpen && (
        <div
          className="bg-white border rounded shadow-lg position-fixed d-lg-none"
          style={{
            top: "70px",
            right: "15px",
            zIndex: 1001,
            minWidth: "200px"
          }}
        >
          <div className="p-2">
            {iconLinks.map((link, index) => (
              <div key={index}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className={`d-flex align-items-center text-decoration-none p-3 rounded ${
                      location.pathname === link.to ? "bg-primary text-white" : "text-dark"
                    }`}
                    onClick={() => setIsIconMenuOpen(false)}
                    style={{ 
                      transition: "all 0.2s ease",
                      borderRadius: "8px",
                      margin: "2px 0"
                    }}
                  >
                    <FontAwesomeIcon icon={link.icon} className="me-3" />
                    <span>{link.title}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      link.action();
                      setIsIconMenuOpen(false);
                    }}
                    className="d-flex align-items-center text-dark p-3 btn border-0 bg-transparent text-start w-100 rounded"
                    style={{ 
                      transition: "all 0.2s ease",
                      borderRadius: "8px",
                      margin: "2px 0"
                    }}
                  >
                    <FontAwesomeIcon icon={link.icon} className="me-3" />
                    <span>{link.title}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Category Nav with Toggle Button */}
      <nav
        className="navbar navbar-expand-lg d-none d-lg-block shadow-sm"
        style={{
          position: "fixed",
          top: "70px",
          width: "100%",
          zIndex: 900,
          backgroundColor: "rgb(71, 114, 199)",
          padding: "8px 0",
          transition: "transform 0.3s ease-in-out",
          transform: showCategoryNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="container-fluid px-3">
          <div className="d-flex justify-content-start align-items-center w-100">
            <button 
              className="btn btn-outline-light sidebar-toggle me-4"
              onClick={() => setShowSidebar(!showSidebar)}
              style={{ borderRadius: "8px" }}
            >
              <FontAwesomeIcon icon={faBars} className="me-2" />
              All Categories
            </button>
            
            <div className="d-flex">
              {categories.map(({ to, label }, index) => (
                <Link 
                  key={index} 
                  to={to} 
                  className="nav-link text-white px-3 py-2 mx-1 rounded"
                  style={{ 
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Category Nav */}
      <nav
        className="d-lg-none"
        style={{
          position: "fixed",
          top: "130px",
          width: "100%",
          zIndex: 900,
          backgroundColor: "rgb(71, 114, 199)",
          padding: "8px 0",
          transition: "transform 0.3s ease-in-out",
          transform: showCategoryNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="container-fluid px-3">
          <div className="d-flex align-items-center">
            <button 
              className="btn btn-outline-light sidebar-toggle me-3 flex-shrink-0"
              onClick={() => setShowSidebar(!showSidebar)}
              style={{ 
                borderRadius: "8px",
                fontSize: "12px",
                padding: "6px 12px"
              }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            
            <div 
              className="d-flex overflow-auto flex-nowrap"
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
                  className="btn btn-outline-light me-2 flex-shrink-0"
                  style={{ 
                    whiteSpace: "nowrap",
                    fontSize: "12px",
                    borderRadius: "20px",
                    padding: "6px 12px"
                  }}
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
          left: showSidebar ? 0 : '-320px',
          width: '320px',
          height: '100vh',
          zIndex: 1500,
          transition: 'left 0.3s ease-in-out',
          boxShadow: showSidebar ? '5px 0 15px rgba(0,0,0,0.2)' : 'none',
          overflowY: 'auto',
          paddingTop: '20px'
        }}
      >
        <div className="d-flex justify-content-between align-items-center px-4 mb-4 pb-3 border-bottom">
          <h5 className="m-0 text-dark fw-bold">Menu</h5>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowSidebar(false)}
            style={{ borderRadius: "50%" }}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>
        
        <div className="px-4">
          {/* Categories in sidebar */}
          <h6 className="text-dark mb-3 fw-bold text-uppercase" style={{ fontSize: "14px" }}>
            Categories
          </h6>
          {categories.map(({ to, label }, index) => (
            <Link 
              key={index} 
              to={to} 
              className="d-flex align-items-center text-dark py-3 text-decoration-none border-bottom"
              onClick={() => setShowSidebar(false)}
              style={{ 
                fontSize: "15px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              <span className="ms-2">{label}</span>
            </Link>
          ))}
          
          {/* Icon links in sidebar */}
          <h6 className="text-dark mb-3 mt-4 fw-bold text-uppercase" style={{ fontSize: "14px" }}>
            Quick Links
          </h6>
          {iconLinks.map((link, index) => (
            <div key={index}>
              {link.to ? (
                <Link
                  to={link.to}
                  className="d-flex align-items-center text-dark py-3 text-decoration-none border-bottom"
                  onClick={() => setShowSidebar(false)}
                  style={{ 
                    fontSize: "15px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  <FontAwesomeIcon icon={link.icon} className="me-3 text-primary" />
                  <span>{link.title}</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    link.action();
                    setShowSidebar(false);
                  }}
                  className="d-flex align-items-center text-dark py-3 text-decoration-none border-bottom btn border-0 bg-transparent text-start w-100"
                  style={{ 
                    fontSize: "15px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
                >
                  <FontAwesomeIcon icon={link.icon} className="me-3 text-primary" />
                  <span>{link.title}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Overlay for sidebar */}
      {showSidebar && (
        <div 
          className="position-fixed w-100 h-100"
          style={{ 
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1400,
          }}
          onClick={() => setShowSidebar(false)}
        ></div>
      )}

      {/* Spacers for content below navbar */}
      <div className="d-lg-none" style={{ height: "190px" }}></div>
      <div className="d-none d-lg-block" style={{ height: "130px" }}></div>
    </>
  );
}

export default Header;
