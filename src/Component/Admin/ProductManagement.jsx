import React, { useEffect, useState } from "react";
import Head from "./partials/Head";
import Header from "./partials/Header";
import LeftSidebar from "./partials/LeftSidebar";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/active`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  const toggleAdvertisement = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/advertise/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error("Failed to update advertisement status");
      }

      setProducts(products.map(product =>
        product._id === id ? { ...product, isAdvertised: !product.isAdvertised } : product
      ));
    } catch (err) {
      console.error("Advertisement error:", err);
      alert("Failed to update advertisement status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Head />
        <Header />
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head />
        <Header />
        <div className="alert alert-danger text-center mt-5">
          Error: {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Head />
      <Header />
      <section id="mid">
        <div className="container-fluid">
          <div className="row">
            <LeftSidebar />
            <div className="col-md-9 p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">PRODUCT MANAGEMENT</h2>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Sr. No</th>
                      <th>Product Name</th>
                      <th>Seller</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th className="text-center">Advertisement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length > 0 ? (
                      products.map((product, index) => (
                        <tr key={product._id}>
                          <td>{index + 1}</td>
                          <td>{product.name}</td>
                          <td>{product.seller?.businessName || "N/A"}</td>
                          <td>₹{product.price?.toLocaleString() || "0"}</td>
                          <td>
                            <span className={`badge ${product.status === "active" ? "bg-success" : "bg-danger"}`}>
                              {product.status || "inactive"}
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              className={`btn btn-sm ${product.isAdvertised ? "btn-success" : "btn-outline-secondary"}`}
                              onClick={() => toggleAdvertisement(product._id)}
                              disabled={loading}
                            >
                              {product.isAdvertised ? (
                                <>
                                  <i className="bi bi-megaphone-fill me-1"></i> Active
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-megaphone me-1"></i> Inactive
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4">
                          No products found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductManagement;