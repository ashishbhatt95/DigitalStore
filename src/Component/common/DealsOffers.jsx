import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DealsOffers = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/advertised`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch deals: ${response.status}`);
        }

        const data = await response.json();
        setDeals(data.products || []);
      } catch (error) {
        console.error("Error fetching deals:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section id="Dealsoffer" className="py-5 bg-white">
        <div className="container-fluid text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading deals...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="Dealsoffer" className="py-5 bg-white">
        <div className="container-fluid text-center">
          <div className="alert alert-danger">
            {error}
            <button 
              className="btn btn-sm btn-outline-danger ms-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (deals.length === 0) {
    return (
      <section id="Dealsoffer" className="py-5 bg-white">
        <div className="container-fluid text-center">
          <p className="text-muted">No deals available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="Dealsoffer" className="py-5 bg-white">
      <div className="container-fluid">
        <h2 className="text-center mb-4 text-primary">🔥 Latest Deals & Offers</h2>

        <div className="position-relative px-4">
          {/* Left Scroll Button */}
          {deals.length > 1 && (
            <button
              className="btn btn-dark position-absolute top-50 start-0 translate-middle-y rounded-circle"
              onClick={scrollLeft}
              aria-label="Scroll Left"
              style={{ zIndex: 10, width: "40px", height: "40px" }}
            >
              <FaChevronLeft />
            </button>
          )}

          {/* Scrollable Deals Container */}
          <motion.div
            ref={sliderRef}
            className="d-flex gap-3 p-2"
            style={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {deals.map((deal) => {
              const originalPrice = deal.price || 0;
              const discountedPrice = (originalPrice * 0.9).toFixed(2); // 10% OFF
              const imageUrl = deal.images?.[0] || "/placeholder-deal.jpg";

              return (
                <Link
                  to={`/product/${deal._id}`}
                  key={deal._id}
                  className="text-decoration-none text-dark"
                  style={{ flexShrink: 0 }}
                >
                  <motion.div
                    className="card shadow-sm position-relative h-100"
                    style={{ width: "250px" }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={imageUrl}
                      alt={deal.name || "Deal Image"}
                      className="card-img-top p-2"
                      style={{ 
                        height: "180px", 
                        objectFit: "contain",
                        backgroundColor: "#f8f9fa" 
                      }}
                      onError={(e) => {
                        e.target.src = "/placeholder-deal.jpg";
                      }}
                    />

                    <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                      10% OFF
                    </span>

                    <div className="card-body d-flex flex-column">
                      <h6 
                        className="card-title text-truncate" 
                        title={deal.name}
                        style={{ minHeight: "48px" }}
                      >
                        {deal.name}
                      </h6>
                      <div className="mt-auto">
                        <p className="card-text mb-2">
                          <span className="text-muted text-decoration-line-through me-2">
                            ₹{originalPrice.toLocaleString()}
                          </span>
                          <span className="text-success fw-bold">
                            ₹{discountedPrice}
                          </span>
                        </p>
                        <button className="btn btn-success w-100 py-2">
                          Shop Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>

          {/* Right Scroll Button */}
          {deals.length > 1 && (
            <button
              className="btn btn-dark position-absolute top-50 end-0 translate-middle-y rounded-circle"
              onClick={scrollRight}
              aria-label="Scroll Right"
              style={{ zIndex: 10, width: "40px", height: "40px" }}
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default DealsOffers;