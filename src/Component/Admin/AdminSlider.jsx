import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./partials/Header";
import LeftSidebar from "./partials/LeftSidebar";

const AdminSlider = () => {
  const [imageFile, setImageFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      navigate("/login"); 
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      alert("Please select an image file (jpg, png, etc.)");
      return;
    }

    // Validate file size (e.g., 5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);

    // Preview Image
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      alert("Please select an image to upload!");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);
    formData.append("description", description);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/sliders`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to upload slider");
      }

      alert("Slider uploaded successfully!");
      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setTitle("");
    setDescription("");
    setPreview("");
    document.getElementById("fileInput").value = "";
  };

  // Custom style for the image preview with 150x150px size (1.5x of original 100px)
  const previewImgStyle = {
    maxWidth: "150px",
    maxHeight: "150px",
    objectFit: "contain",
    border: "1px solid #ccc",
    borderRadius: "4px",
    margin: "0 auto",
    display: "block"
  };

  return (
    <>
      <Header />
      <section id="mid">
        <div className="container">
          <div className="row">
            <LeftSidebar />

            <div className="col-md-9 mt-5">
              <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
                <h2 className="text-xl font-bold mb-4 text-center">Slider Management</h2>

                <form onSubmit={handleSubmit} className="border p-4 rounded-lg shadow-md">
                  <div className="mb-4">
                    <label className="block font-semibold">Upload Image (Max 5MB):</label>
                    <input
                      type="file"
                      id="fileInput"
                      className="w-full p-2 border rounded mb-2"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                    />
                    {preview && (
                      <div className="mt-2 text-center">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          style={previewImgStyle}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block font-semibold">Title:</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Enter Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      minLength={3}
                      maxLength={100}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block font-semibold">Description:</label>
                    <textarea
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Enter Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      minLength={10}
                      maxLength={500}
                      rows={4}
                    />
                  </div>

                  <button
                    type="submit"
                    className="form-control btn btn-dark bg-blue-600 text-white px-4 py-2 rounded-lg w-full disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Uploading...
                      </>
                    ) : "Add Slider"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminSlider;