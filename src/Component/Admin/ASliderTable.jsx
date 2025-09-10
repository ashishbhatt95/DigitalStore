import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Head from "./partials/Head";
import Header from "./partials/Header";
import LeftSidebar from "./partials/LeftSidebar";

const ASliderTable = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    imageUrl: "" 
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on component mount
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      navigate("/login");
    } else {
      fetchSliders();
    }
  }, [navigate]);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sliders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Check for non-JSON response
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid response from server");
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to fetch sliders");
      }

      setSliders(data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message || "An error occurred while fetching sliders");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slide?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sliders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete slider");
      }

      setSliders(sliders.filter((slider) => slider._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete slider");
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide._id);
    setFormData({ 
      title: slide.title, 
      description: slide.description, 
      imageUrl: slide.imageUrl 
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sliders/${editingSlide}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // Check for non-JSON response
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid response from server");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update slider");
      }

      setSliders(sliders.map((s) => 
        s._id === editingSlide ? { ...s, ...formData } : s
      ));
      setEditingSlide(null);
      setFormData({ title: "", description: "", imageUrl: "" });
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message || "Failed to update slider");
    }
  };

  return (
    <>
      <Head />
      <Header />
      <section id="mid">
        <div className="container-fluid">
          <div className="row">
            <LeftSidebar />
            <div className="col-md-9 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">SLIDER MANAGEMENT</h2>
                <Link to="/admin/AdminSlider" className="btn btn-dark">
                  + Add New Slide
                </Link>
              </div>

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Loading sliders...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <strong>Error:</strong> {error}
                  <button 
                    className="btn btn-sm btn-outline-danger ms-2"
                    onClick={fetchSliders}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    <thead className="bg-dark text-white">
                      <tr>
                        <th>ID</th>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sliders.length > 0 ? (
                        sliders.map((slider, index) => (
                          <tr key={slider._id}>
                            <td>{index + 1}</td>
                            <td>
                              <img
                                src={slider.imageUrl || "/default-slider.jpg"}
                                alt="Slider"
                                width="100"
                                height="60"
                                className="img-thumbnail"
                                onError={(e) => {
                                  e.target.src = "/default-slider.jpg";
                                }}
                              />
                            </td>
                            <td>{slider.title || "No Title"}</td>
                            <td className="text-truncate" style={{ maxWidth: "200px" }}>
                              {slider.description || "No Description"}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button 
                                  className="btn btn-sm btn-warning"
                                  onClick={() => handleEdit(slider)}
                                >
                                  <i className="bi bi-pencil"></i> Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(slider._id)}
                                >
                                  <i className="bi bi-trash"></i> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            <div className="alert alert-info mb-0">
                              No sliders found. <Link to="/admin/AdminSlider">Add a new slider</Link>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {editingSlide && (
                <div className="card p-3 mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3 className="mb-0">Edit Slide</h3>
                    <button 
                      className="btn-close" 
                      onClick={() => setEditingSlide(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      minLength={3}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      required
                    />
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="img-thumbnail" 
                          width="150"
                          onError={(e) => {
                            e.target.src = "/default-slider.jpg";
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-success"
                      onClick={handleUpdate}
                      disabled={!formData.title || !formData.imageUrl}
                    >
                      <i className="bi bi-check-circle"></i> Save Changes
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setEditingSlide(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ASliderTable;