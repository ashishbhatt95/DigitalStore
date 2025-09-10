import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import {
  FaTrash,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaPlus,
  FaMinus,
  FaArrowLeft,
  FaShoppingBag,
  FaGift,
  FaTruck,
  FaMoneyBillWave,
} from "react-icons/fa";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [deliveryAddress] = useState("Harsh Nama, Jaipur, Rajasthan - 302001");
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const navigate = useNavigate();

  // Get token with fallback methods
  const getToken = () => {
    // Try multiple token sources
    return localStorage.getItem("token") || 
           localStorage.getItem("authToken") || 
           localStorage.getItem("jwt") || 
           localStorage.getItem("userToken") ||
           getCookie("token") ||
           getCookie("authToken");
  };

  // Helper function to get cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      fetchRecommendedProducts();
    }
  }, [loading, cartItems.length]);

  const fetchCartData = async () => {
    const token = getToken();
    if (!token) {
      console.log("No token found, showing empty cart");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.log("Unauthorized, clearing token");
          localStorage.clear();
          setCartItems([]);
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Cart data:", data);

      if (data.success && data.cart && Array.isArray(data.cart.items)) {
        setCartItems(data.cart.items);
      } else if (Array.isArray(data.items)) {
        setCartItems(data.items);
      } else if (Array.isArray(data)) {
        setCartItems(data);
      } else {
        console.warn("Unexpected cart data structure:", data);
        setCartItems([]);
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async () => {
    setLoadingRecommendations(true);
    try {
      const token = getToken();
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/active`, {
        method: "GET",
        credentials: "include",
        headers,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Recommended products:", data);

      if (data.success && Array.isArray(data.products)) {
        // Limit to 8 products for better UX
        setRecommendedProducts(data.products.slice(0, 8));
      } else if (Array.isArray(data)) {
        setRecommendedProducts(data.slice(0, 8));
      } else {
        console.warn("No products found");
        setRecommendedProducts([]);
      }
    } catch (error) {
      console.error("Error fetching recommended products:", error);
      setRecommendedProducts([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    const token = getToken();
    if (!token) {
      alert("Please login first!");
      navigate("/Login");
      return;
    }

    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    try {
      setUpdatingItemId(productId);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/update`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          productId: productId.toString(), 
          quantity: Number(quantity) 
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/Login");
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Update response:", data);

      if (data.success && data.cart?.items) {
        setCartItems(data.cart.items);
      } else if (data.items) {
        setCartItems(data.items);
      } else {
        // Fallback: update locally
        setCartItems(prevItems => 
          prevItems.map(item => {
            const itemProductId = getProductId(item);
            return itemProductId === productId 
              ? { ...item, quantity: Number(quantity) }
              : item;
          })
        );
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      alert("Failed to update quantity. Please try again.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Helper function to get product ID from item
  const getProductId = (item) => {
    if (!item || !item.product) return null;
    return typeof item.product === "string" ? item.product : item.product._id;
  };

  const increaseQuantity = (item) => {
    const productId = getProductId(item);
    if (!productId) {
      console.warn("Missing product ID for increaseQuantity", item);
      return;
    }
    updateQuantity(productId, item.quantity + 1);
  };
  
  const decreaseQuantity = (item) => {
    const productId = getProductId(item);
    if (!productId) {
      console.warn("Missing product ID for decreaseQuantity", item);
      return;
    }
    if (item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    } else {
      removeItem(productId);
    }
  };

  const removeItem = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    const token = getToken();
    if (!token) {
      alert("Please login first!");
      navigate("/Login");
      return;
    }

    try {
      setUpdatingItemId(productId);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/remove`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: productId.toString() }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/Login");
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Remove response:", data);

      if (data.success && data.cart?.items) {
        setCartItems(data.cart.items);
      } else if (data.items) {
        setCartItems(data.items);
      } else {
        // Fallback: remove locally
        setCartItems(prevItems => 
          prevItems.filter(item => getProductId(item) !== productId)
        );
      }
      
      // If cart becomes empty, fetch recommendations
      if (cartItems.length === 1) {
        fetchRecommendedProducts();
      }
    } catch (error) {
      console.error("❌ Remove item error:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const addToCart = async (product) => {
    const token = getToken();
    if (!token) {
      alert("Please login first!");
      navigate("/Login");
      return;
    }

    if (!product || !product._id) {
      alert("Invalid product!");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          productId: product._id.toString(), 
          quantity: 1 
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Session expired. Please login again.");
          navigate("/Login");
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Add to cart response:", data);

      if (data.success && data.cart?.items) {
        setCartItems(data.cart.items);
        alert(`${product.name} added to cart!`);
      } else if (data.items) {
        setCartItems(data.items);
        alert(`${product.name} added to cart!`);
      } else {
        alert(data.message || "Added to cart successfully!");
        fetchCartData(); // Refresh cart
      }
    } catch (error) {
      console.error("❌ Add to cart error:", error);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  const handleCheckout = () => {
    const token = getToken();
    if (!token) {
      alert("Please login to continue with checkout");
      navigate("/Login");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    navigate("/Customer/Checkout");
  };

  // Safe calculation functions
  const calculateTotalPrice = () => {
    return cartItems.reduce((acc, item) => {
      if (!item || !item.product || typeof item.quantity !== 'number') return acc;
      const price = Number(item.product.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return acc + (price * quantity);
    }, 0);
  };

  const totalPrice = calculateTotalPrice();
  const deliveryFee = totalPrice > 1000 ? 0 : 50;
  const tax = Math.round(totalPrice * 0.18);
  const finalPrice = totalPrice + deliveryFee + tax;

  return (
    <>
      <Header />

      <div className="container mt-5 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="d-flex align-items-center gap-2 mb-0">
            <FaShoppingCart className="text-primary" /> My Shopping Cart
          </h2>
          {cartItems.length > 0 && (
            <span className="badge bg-primary rounded-pill fs-6">{cartItems.length} Items</span>
          )}
        </div>

        {loading ? (
          <div className="text-center my-5 py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
            <p className="mt-4 fs-5">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-3 shadow-sm p-4 text-center my-5">
            <div className="py-5">
              <div className="mb-4 text-muted">
                <FaShoppingBag size={80} className="text-secondary opacity-50" />
              </div>
              <h3 className="mb-3">Your cart is empty</h3>
              <p className="text-muted mb-4 col-md-8 mx-auto">
                Looks like you haven't added anything to your cart yet. Explore our products and find something you like!
              </p>
              <button 
                className="btn btn-primary btn-lg px-4 d-inline-flex align-items-center gap-2"
                onClick={() => navigate("/")}
              >
                <FaArrowLeft /> Continue Shopping
              </button>
            </div>
            
            {/* Recommended Products */}
            <div className="mt-5 pt-4 border-top">
              <h4 className="mb-4">Products You Might Like</h4>
              
              {loadingRecommendations ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="mt-3">Loading recommendations...</p>
                </div>
              ) : recommendedProducts.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-4 g-4">
                  {recommendedProducts.map((product) => (
                    <div key={product._id} className="col">
                      <div className="card h-100 border-0 shadow-sm product-card">
                        <div className="position-relative">
                          <img 
                            src={product.images?.[0] || "/placeholder-image.jpg"} 
                            className="card-img-top" 
                            style={{
                              height: "200px",
                              width: "100%",
                              objectFit: "contain"
                            }}
                            alt={product.name || "Product"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                          {product.discount > 0 && (
                            <span className="position-absolute top-0 start-0 badge bg-danger m-2">
                              {product.discount}% OFF
                            </span>
                          )}
                        </div>
                        <div className="card-body">
                          <h6 className="card-title mb-1 text-truncate">{product.name || "Unknown Product"}</h6>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                              <span className="fw-bold text-primary">₹{Number(product.price) || 0}</span>
                              {product.discount > 0 && (
                                <small className="text-muted text-decoration-line-through ms-2">
                                  ₹{Math.round((Number(product.price) || 0) * (1 + (Number(product.discount) || 0) / 100))}
                                </small>
                              )}
                            </div>
                            <div className="text-warning">
                              {'★'.repeat(Math.floor(Number(product.rating) || 0))}
                              {'☆'.repeat(5 - Math.floor(Number(product.rating) || 0))}
                            </div>
                          </div>
                          <button 
                            className="btn btn-outline-primary btn-sm w-100"
                            onClick={() => addToCart(product)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No recommendations available at the moment.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-md-8">
              <div className="bg-white rounded-3 shadow-sm p-4 mb-4">
                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="text-primary me-2" />
                  <span><strong>Deliver to:</strong> {deliveryAddress}</span>
                  <button className="btn btn-sm btn-link ms-auto">Change</button>
                </div>
                <div className="alert alert-success d-flex align-items-center p-2 mb-0">
                  <FaTruck className="me-2" />
                  <small>Free delivery on orders above ₹1000</small>
                </div>
              </div>

              {cartItems.map((item, index) => {
                if (!item || !item.product) return null;
                
                const productId = getProductId(item);
                const product = item.product;
                const isUpdating = updatingItemId === productId;

                return (
                  <div key={productId || index} className="card mb-3 shadow-sm border-0 rounded-3 overflow-hidden">
                    <div className="card-body p-0">
                      <div className="row g-0">
                        <div className="col-md-3 bg-light d-flex align-items-center justify-content-center p-3">
                          <img
                            src={product.images?.[0] || "/placeholder-image.jpg"}
                            alt={product.name || "Product"}
                            className="img-fluid rounded"
                            style={{ maxHeight: "120px", objectFit: "contain" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                        <div className="col-md-9">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-8">
                                <h5 className="card-title">{product.name || "Unknown Product"}</h5>
                                <p className="text-muted mb-1 small">
                                  Added on: {new Date(item.addedAt || Date.now()).toLocaleDateString()}
                                </p>
                                <div className="d-flex align-items-center mt-3">
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => decreaseQuantity(item)}
                                    disabled={isUpdating}
                                  >
                                    <FaMinus />
                                  </button>
                                  <span className="px-3 fw-bold">{Number(item.quantity) || 0}</span>
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => increaseQuantity(item)}
                                    disabled={isUpdating}
                                  >
                                    <FaPlus />
                                  </button>
                                  <button
                                    className="btn btn-outline-danger btn-sm ms-4"
                                    onClick={() => removeItem(productId)}
                                    disabled={isUpdating}
                                  >
                                    <FaTrash className="me-1" /> Remove
                                  </button>
                                </div>
                              </div>
                              <div className="col-md-4 text-end">
                                <h5 className="text-primary">₹{Number(product.price) || 0}</h5>
                                <span className="badge bg-success mb-2">In Stock</span>
                                <p className="text-muted small mb-0">
                                  {isUpdating ? (
                                    <small>Updating...</small>
                                  ) : (
                                    <small>Unit Price: ₹{Number(product.price) || 0}</small>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm border-0 rounded-3 sticky-top" style={{ top: "1rem" }}>
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Items ({cartItems.length})</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      <span>₹{deliveryFee}</span>
                    )}
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax (18%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-3 fw-bold">
                    <span>Total Amount</span>
                    <span>₹{finalPrice}</span>
                  </div>
                  <button
                    className="btn btn-primary w-100 py-2"
                    disabled={cartItems.length === 0}
                    onClick={handleCheckout}
                  >
                    <FaMoneyBillWave className="me-2" />Proceed to Checkout
                  </button>
                  <div className="mt-3 text-center">
                    <small className="text-muted">
                      <FaGift className="me-1" /> Congratulations! You'll earn <span className="text-success fw-bold">{Math.floor(finalPrice * 0.05)}</span> reward points with this purchase.
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Cart;