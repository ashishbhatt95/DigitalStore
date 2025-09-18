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
      {/* Top Navbar */}
      <nav
        className="navbar navbar-expand-lg fixed-top"
        style={{
          zIndex: 1000,
          backgroundImage: "linear-gradient(to right, rgb(85, 82, 82), black, rgb(206, 200, 200), black)",
          padding: "8px 12px",
          minHeight: "60px",
        }}
      >
        <div className="container-fluid px-1">
          {/* Mobile View - Up to md (768px) */}
          <div className="d-flex d-lg-none align-items-center justify-content-between w-100" style={{ minHeight: "44px" }}>
            {/* Logo - Mobile */}
            <Link to="/" className="navbar-brand me-2">
              <img
                src="https://digitalstore.blr1.cdn.digitaloceanspaces.com/main.png"
                alt="Logo"
                style={{ height: "32px" }}
              />
            </Link>

            {/* Right Icons */}
            <div className="d-flex align-items-center">
              <button
                className="btn text-white p-2 me-2"
                onClick={() => setIsIconMenuOpen(!isIconMenuOpen)}
                style={{ fontSize: "16px" }}
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            </div>
          </div>

          {/* Desktop View - lg and above (1024px+) */}
          <div className="d-none d-lg-flex align-items-center w-100">
            {/* Left: Logo */}
            <Link to="/" className="navbar-brand me-4">
              <img
                src="https://digitalstore.blr1.cdn.digitaloceanspaces.com/main.png"
                alt="Logo"
                style={{ height: "40px" }}
              />
            </Link>

            {/* Center: Search Bar - Takes available space */}
            <div className="flex-grow-1 mx-3" style={{ maxWidth: "500px" }}>
              <form onSubmit={handleSearch} className="position-relative">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control rounded-pill"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      fontSize: "15px",
                      padding: "8px 45px 8px 16px",
                      border: "1px solid #ccc",
                      backgroundColor: "#fff",
                    }}
                  />
                  <button
                    type="submit"
                    className="btn position-absolute end-0 top-50 translate-middle-y me-2"
                    style={{ 
                      background: "none", 
                      border: "none",
                      zIndex: 5,
                      color: "#666"
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Navigation Icons */}
            <ul className="navbar-nav d-flex flex-row ms-3">
              {iconLinks.map((link, index) => (
                <li key={index} className="nav-item mx-1">
                  {link.to ? (
                    <Link
                      to={link.to}
                      className={`nav-link text-white text-center ${
                        location.pathname === link.to ? "fw-bold text-warning" : ""
                      }`}
                      style={{ fontSize: "12px", padding: "4px 8px" }}
                    >
                      <FontAwesomeIcon icon={link.icon} className="d-block mb-1" />
                      <span className="d-block">{link.title}</span>
                    </Link>
                  ) : (
                    <button
                      onClick={link.action}
                      className="nav-link text-white btn border-0 bg-transparent text-center"
                      style={{ fontSize: "12px", padding: "4px 8px" }}
                    >
                      <FontAwesomeIcon icon={link.icon} className="d-block mb-1" />
                      <span className="d-block">{link.title}</span>
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
          top: "60px",
          zIndex: 999,
          backgroundImage: "linear-gradient(to right, rgb(85, 82, 82), black, rgb(206, 200, 200), black)",
          padding: "8px 12px",
        }}
      >
        <form onSubmit={handleSearch} className="position-relative">
          <div className="input-group">
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                fontSize: "15px",
                padding: "8px 45px 8px 16px",
                border: "1px solid #ccc",
              }}
            />
            <button
              type="submit"
              className="btn position-absolute end-0 top-50 translate-middle-y me-2"
              style={{ 
                background: "none", 
                border: "none",
                zIndex: 5,
                color: "#666"
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
          className="bg-dark rounded p-3 position-fixed d-lg-none shadow-lg"
          style={{
            top: "105px",
            right: "12px",
            zIndex: 1001,
            minWidth: "200px",
          }}
        >
          {iconLinks.map((link, index) => (
            <div key={index} className="mb-2">
              {link.to ? (
                <Link
                  to={link.to}
                  className={`d-flex align-items-center text-white py-2 px-3 rounded text-decoration-none ${
                    location.pathname === link.to ? "bg-primary" : ""
                  }`}
                  onClick={() => setIsIconMenuOpen(false)}
                  style={{ fontSize: "14px" }}
                >
                  <FontAwesomeIcon icon={link.icon} className="me-3" />
                  {link.title}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    link.action();
                    setIsIconMenuOpen(false);
                  }}
                  className="d-flex align-items-center text-white py-2 px-3 rounded btn border-0 bg-transparent text-start w-100"
                  style={{ fontSize: "14px" }}
                >
                  <FontAwesomeIcon icon={link.icon} className="me-3" />
                  {link.title}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Category Navigation - Desktop */}
      <nav
        className="navbar navbar-expand-lg d-none d-lg-block fixed-top"
        style={{
          top: "60px",
          zIndex: 900,
          backgroundColor: "rgb(71, 114, 199)",
          padding: "8px 12px",
          transition: "transform 0.3s ease-in-out",
          transform: showCategoryNav ? "translateY(0)" : "translateY(-100%)",
        }}
      >
        <div className="container-fluid px-1">
          <div className="d-flex justify-content-start align-items-center w-100">
            <button 
              className="btn btn-outline-light sidebar-toggle me-3"
              onClick={() => setShowSidebar(!showSidebar)}
              style={{ fontSize: "14px", padding: "4px 8px" }}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <ul className="navbar-nav d-flex flex-row">
              {categories.map(({ to, label }, index) => (
                <li key={index} className="nav-item me-3">
                  <Link 
                    to={to} 
                    className="nav-link text-white px-2 py-1"
                    style={{ 
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                      textDecoration: "none"
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Category Navigation - Mobile */}
      <nav
        className="d-lg-none fixed-top"
        style={{
          top: "108px",
          zIndex: 900,
          backgroundColor: "rgb(71, 114, 199)",
          overflowX: "auto",
          padding: "8px 0",
          transition: "transform 0.3s ease-in-out",
          transform: showCategoryNav ? "translateY(0)" : "translateY(-100%)",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="d-flex align-items-center px-2" style={{ minWidth: "max-content" }}>
          <button 
            className="btn btn-outline-light sidebar-toggle me-3 flex-shrink-0"
            onClick={() => setShowSidebar(!showSidebar)}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <div className="d-flex">
            {categories.map(({ to, label }, index) => (
              <Link
                key={index}
                to={to}
                className="btn btn-outline-light me-2 flex-shrink-0"
                style={{ 
                  whiteSpace: "nowrap",
                  fontSize: "12px",
                  padding: "4px 12px"
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`position-fixed bg-white shadow-lg ${showSidebar ? 'show' : ''}`}
        style={{
          top: 0,
          left: showSidebar ? 0 : '-300px',
          width: '300px',
          height: '100vh',
          zIndex: 1500,
          transition: 'left 0.3s ease-in-out',
          overflowY: 'auto',
        }}
      >
        {/* Sidebar Header */}
        <div className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom" style={{ backgroundColor: "#f8f9fa" }}>
          <h5 className="m-0 text-dark">Menu</h5>
          <button 
            className="btn btn-outline-dark btn-sm"
            onClick={() => setShowSidebar(false)}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>
        </div>

        <div className="p-0">
          {/* Categories in sidebar */}
          <div className="border-bottom">
            <h6 className="text-dark px-3 py-2 mb-0 bg-light fw-bold border-bottom">
              Categories
            </h6>
            {categories.map(({ to, label }, index) => (
              <Link 
                key={index} 
                to={to} 
                className="d-block text-dark py-2 px-3 text-decoration-none border-bottom"
                onClick={() => setShowSidebar(false)}
                style={{ 
                  fontSize: "15px",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                onMouseLeave={(e) => e.target.style.backgroundColor = ""}
              >
                {label}
              </Link>
            ))}
          </div>
          
          {/* Quick Links */}
          <div>
            <h6 className="text-dark px-3 py-2 mb-0 bg-light fw-bold border-bottom">
              Quick Links
            </h6>
            {iconLinks.filter(link => link.title !== "Home").map((link, index) => (
              <div key={index}>
                {link.to ? (
                  <Link
                    to={link.to}
                    className="d-block text-dark py-2 px-3 text-decoration-none border-bottom"
                    onClick={() => setShowSidebar(false)}
                    style={{ 
                      fontSize: "15px",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = ""}
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
                    className="d-block text-dark py-2 px-3 text-decoration-none border-bottom btn border-0 bg-transparent text-start w-100"
                    style={{ 
                      fontSize: "15px",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f8f9fa"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = ""}
                  >
                    <FontAwesomeIcon icon={link.icon} className="me-3" />
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
      <div className="d-lg-none" style={{ height: "148px" }}></div>
      <div className="d-none d-lg-block" style={{ height: "100px" }}></div>
    </>
  );
}

export default Header;
