import React, { useEffect, useState } from "react";
import Head from "./partials/Head";
import Header from "./partials/Header";
import LeftSidebar from "./partials/LeftSidebar";
import { useNavigate } from "react-router-dom";

const BusinessManage = ({ children }) => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sellers`, {
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
          throw new Error("Failed to fetch sellers");
        }

        const data = await response.json();
        setSellers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [navigate]);

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Blocked" ? "Active" : "Blocked";
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sellers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setSellers(sellers.map(seller =>
        seller._id === id ? { ...seller, approved: newStatus === "Active" } : seller
      ));
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
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
                <h2 className="mb-0">BUSINESS SELLER MANAGEMENT</h2>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Sr. No</th>
                      <th>Business Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellers.length > 0 ? (
                      sellers.map((seller, index) => (
                        <tr key={seller._id}>
                          <td>{index + 1}</td>
                          <td>{seller.businessName}</td>
                          <td>{seller.businessEmail}</td>
                          <td>
                            <span className={`badge ${seller.approved ? "bg-success" : "bg-danger"}`}>
                              {seller.approved ? "Active" : "Blocked"}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${seller.approved ? "btn-danger" : "btn-success"}`}
                              onClick={() => toggleStatus(seller._id, seller.approved ? "Active" : "Blocked")}
                            >
                              {seller.approved ? "Block" : "Unblock"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          No sellers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {children}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BusinessManage;