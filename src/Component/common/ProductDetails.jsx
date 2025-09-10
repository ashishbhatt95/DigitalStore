import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoadingProduct(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }

      const data = await response.json();
      const fetchedProduct = data.product;

      setProduct(fetchedProduct);
      if (fetchedProduct.images?.length) {
        setMainImage(fetchedProduct.images[0]);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      alert(err.message || "Failed to fetch product details.");
    } finally {
      setLoadingProduct(false);
    }
  };

  const changeImage = (index) => {
    setMainImage(product.images?.[index]);
    setActiveIndex(index);
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      setLoadingCart(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/cart/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      alert(data.message || "Product added to cart!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(err.message || "Failed to add to cart");
    } finally {
      setLoadingCart(false);
    }
  };

  const handleCheckout = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to continue with checkout");
      navigate("/login");
      return;
    }
    navigate("/Customer/Cart");
  };

  if (loadingProduct && !product) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center p-5">
        <div className="alert alert-danger">Product not found</div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="container mt-5 mb-5">
        <div className="row">
          {/* Product Images */}
          <div className="col-md-6">
            <div className="d-flex">
              {/* Thumbnails */}
              <div className="d-flex flex-column gap-2 me-2">
                {product.images?.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumb ${index}`}
                    className={`border ${
                      activeIndex === index
                        ? "border-primary border-2"
                        : "border-light"
                    }`}
                    onClick={() => changeImage(index)}
                    style={{
                      cursor: "pointer",
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-product.jpg";
                    }}
                  />
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-grow-1">
                <img
                  src={mainImage || "/placeholder-product.jpg"}
                  alt={product.name}
                  className="img-fluid rounded shadow"
                  style={{
                    maxHeight: "500px",
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                    padding: "1rem",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-product.jpg";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="col-md-6">
            <h1 className="h3 fw-bold">{product.name}</h1>

            <div className="mt-2 d-flex align-items-center">
              <div className="text-warning">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`bi ${
                      i < Math.floor(product.averageRating || 0)
                        ? "bi-star-fill"
                        : "bi-star"
                    }`}
                  ></i>
                ))}
              </div>
              <span className="ms-2 text-muted">
                {product.ratingsCount || 0} ratings
              </span>
            </div>

            <div className="mt-3">
              {product.discount > 0 && (
                <>
                  <span className="text-danger fw-bold me-2">
                    {product.discount}% OFF
                  </span>
                  <span className="text-muted text-decoration-line-through me-2">
                    ₹{product.compareAtPrice?.toLocaleString()}
                  </span>
                </>
              )}
              <span className="text-success fw-bold fs-4">
                ₹{product.price?.toLocaleString()}
              </span>
            </div>

            <div className="mt-4">
              <p className="fw-bold mb-2">About this item:</p>
              <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
                {product.description || "No description available."}
              </p>
            </div>

            {product.colorOptions?.length > 0 && (
              <div className="mt-4">
                <p className="fw-bold mb-2">Color Options:</p>
                <div className="d-flex flex-wrap gap-2">
                  {product.colorOptions.map((color, i) => (
                    <div
                      key={i}
                      className={`border rounded-circle ${
                        color === product.selectedColor
                          ? "border-primary border-2"
                          : "border-secondary"
                      }`}
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: color,
                        cursor: "pointer",
                      }}
                      title={color}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {product.storageOptions?.length > 0 && (
              <div className="mt-4">
                <p className="fw-bold mb-2">Storage Options:</p>
                <div className="d-flex flex-wrap gap-2">
                  {product.storageOptions.map((option, i) => (
                    <button
                      key={i}
                      className={`btn btn-sm ${
                        option === product.selectedStorage
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="fw-bold mb-1">Seller:</p>
              <p>{product.seller?.businessName || "Unknown Seller"}</p>
            </div>

            <div className="mt-4">
              <div className="d-flex align-items-center mb-3">
                <label className="fw-bold me-3">Quantity:</label>
                <div className="input-group" style={{ width: "120px" }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="form-control text-center"
                    value={quantity}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="d-grid gap-3">
                <button
                  className="btn btn-warning py-3 fw-bold"
                  onClick={handleAddToCart}
                  disabled={loadingCart}
                >
                  {loadingCart ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding...
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
                <button
                  className="btn btn-success py-3 fw-bold"
                  onClick={handleCheckout}
                  disabled={loadingCart}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ProductDetails;
