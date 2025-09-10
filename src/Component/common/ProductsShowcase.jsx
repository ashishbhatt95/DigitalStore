import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProductsShowcase = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (!fetched.current) {
      fetched.current = true;
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/active`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 400 : 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="container-fluid my-5 py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading trending products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid my-5 py-4">
        <div className="alert alert-danger text-center">
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={fetchProducts}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container-fluid my-5 py-4">
        <div className="alert alert-info text-center">
          No trending products available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid my-5 px-3">
      <h2 className="h4 mb-4 fw-bold text-center text-uppercase text-dark">
        🔥 Top Trending Products
      </h2>

      <div className="position-relative">
        {/* Scroll buttons */}
        {products.length > 4 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="position-absolute top-50 start-0 translate-middle-y btn btn-light rounded-circle shadow-sm border d-none d-md-block"
              style={{ 
                zIndex: 2, 
                width: "40px", 
                height: "40px",
                left: "-20px"
              }}
              aria-label="Scroll left"
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            <button
              onClick={() => scroll("right")}
              className="position-absolute top-50 end-0 translate-middle-y btn btn-light rounded-circle shadow-sm border d-none d-md-block"
              style={{ 
                zIndex: 2, 
                width: "40px", 
                height: "40px",
                right: "-20px"
              }}
              aria-label="Scroll right"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </>
        )}

        {/* Products container */}
        <div
          ref={scrollRef}
          className="d-flex flex-nowrap overflow-auto py-2"
          style={{ 
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" }
          }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="px-2"
              style={{
                minWidth: "200px",
                maxWidth: "220px",
                flex: "0 0 auto"
              }}
            >
              <div className="position-relative h-100">
                {product.brand && (
                  <span
                    className="badge bg-danger position-absolute top-0 start-0 m-2 px-2 py-1 rounded-pill shadow"
                    style={{ 
                      fontSize: "10px", 
                      fontWeight: "bold",
                      zIndex: 1
                    }}
                  >
                    {product.brand}
                  </span>
                )}

                <Link 
                  to={`/product/${product._id}`} 
                  className="text-decoration-none text-dark h-100 d-block"
                >
                  <div
                    className="card border-0 h-100 shadow-sm rounded-3 p-2"
                    style={{
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                  >
                    <div className="mb-3" style={{ height: "140px" }}>
                      <img
                        src={product.images?.[0] || "/placeholder-product.jpg"}
                        className="img-fluid mx-auto d-block rounded h-100"
                        alt={product.name}
                        style={{ 
                          objectFit: "contain",
                          width: "100%"
                        }}
                        onError={(e) => {
                          e.target.src = "/placeholder-product.jpg";
                        }}
                      />
                    </div>
                    <div className="px-2 pb-2">
                      {product.category && (
                        <h6 
                          className="text-truncate mb-1 text-muted small" 
                          style={{ fontWeight: "500" }}
                        >
                          {product.category}
                        </h6>
                      )}
                      <p 
                        className="fw-bold text-truncate mb-1 text-dark" 
                        style={{ fontSize: "14px" }}
                        title={product.name}
                      >
                        {product.name}
                      </p>
                      <div className="d-flex align-items-center justify-content-between">
                        <p className="m-0 text-success fw-bold">
                          ₹{product.price?.toLocaleString()}
                        </p>
                        {product.discount > 0 && (
                          <span className="badge bg-warning text-dark small">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsShowcase;