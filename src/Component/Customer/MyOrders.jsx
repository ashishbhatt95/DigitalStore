import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import {
  FaShoppingBag,
  FaTruck,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCalendarAlt,
  FaEye,
  FaBox,
  FaStore,
  FaRupeeSign,
  FaGift,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaArrowLeft,
  FaReceipt,
  FaPhone,
} from "react-icons/fa";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  // Get token with fallback methods (same as Cart component)
  const getToken = () => {
    return localStorage.getItem("token") || 
           localStorage.getItem("authToken") || 
           localStorage.getItem("jwt") || 
           localStorage.getItem("userToken") ||
           getCookie("token") ||
           getCookie("authToken");
  };

  // Helper function to get cookie (same as Cart component)
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const statusOptions = ["All", "Pending", "Processing", "Partially Shipped", "Completed", "Cancelled"];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === "All") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.orderStatus === statusFilter));
    }
  }, [statusFilter, orders]);

  const fetchOrders = async () => {
    const token = getToken();
    if (!token) {
      setError("Please login to view your orders");
      setLoading(false);
      navigate("/Login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/customer/list`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.clear();
          navigate("/Login");
          return;
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Orders data:", data);

      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
        setFilteredOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
        setFilteredOrders(data);
      } else {
        console.warn("Unexpected orders data structure:", data);
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "delivered":
        return "badge-success";
      case "processing":
      case "shipped":
        return "badge-info";
      case "partially shipped":
        return "badge-warning";
      case "pending":
        return "badge-warning";
      case "cancelled":
      case "returned":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "failed":
        return "badge-danger";
      case "refunded":
        return "badge-info";
      default:
        return "badge-secondary";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track-order/${orderId}`);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="container-fluid px-4" style={{ minHeight: "60vh" }}>
          <div className="text-center my-5 py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}></div>
            <p className="mt-4 fs-5">Loading your orders...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="container-fluid px-4" style={{ minHeight: "60vh" }}>
          <div className="bg-white rounded-3 shadow-sm p-4 text-center my-5">
            <div className="py-5">
              <div className="mb-4 text-danger">
                <FaExclamationCircle size={80} />
              </div>
              <h3 className="mb-3 text-danger">Error</h3>
              <p className="text-muted mb-4">{error}</p>
              <button 
                className="btn btn-primary btn-lg px-4 d-inline-flex align-items-center gap-2"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <style>
        {`
          .badge-success { background-color: #28a745; color: white; }
          .badge-warning { background-color: #ffc107; color: black; }
          .badge-danger { background-color: #dc3545; color: white; }
          .badge-info { background-color: #17a2b8; color: white; }
          .badge-secondary { background-color: #6c757d; color: white; }
          .order-card { transition: all 0.3s ease; }
          .order-card:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
          .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .order-header { background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%); }
          .item-card { background: #fafbfc; border: 1px solid #e9ecef; }
          .item-card:hover { background: #f1f3f5; }
        `}
      </style>

      <div className="container-fluid px-4 py-4" style={{ minHeight: "70vh", backgroundColor: "#f8f9fa" }}>
        {/* Page Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="d-flex align-items-center gap-3 mb-1">
              <FaShoppingBag className="text-primary" size={28} /> 
              My Orders
            </h2>
            <p className="text-muted mb-0">Track and manage your orders</p>
          </div>
          {orders.length > 0 && (
            <span className="badge bg-primary rounded-pill px-3 py-2" style={{ fontSize: "14px" }}>
              {orders.length} Orders
            </span>
          )}
        </div>

        {/* Filter Section */}
        {orders.length > 0 && (
          <div className="bg-white rounded-3 shadow-sm p-4 mb-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-3">
                  <FaFilter className="text-primary" />
                  <span className="fw-semibold">Filter by Status:</span>
                  <select
                    className="form-select"
                    style={{ width: "200px" }}
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-md-4 text-end">
                <span className="text-muted">
                  Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3 shadow-sm p-5 text-center">
            <div className="py-5">
              <div className="mb-4 text-muted">
                <FaShoppingBag size={100} className="text-secondary opacity-50" />
              </div>
              <h3 className="mb-3">
                {orders.length === 0 ? "No orders found" : `No ${statusFilter.toLowerCase()} orders`}
              </h3>
              <p className="text-muted mb-4 col-md-6 mx-auto">
                {orders.length === 0 
                  ? "You haven't placed any orders yet. Start shopping to see your orders here!"
                  : `No orders found with status "${statusFilter}". Try selecting a different filter.`
                }
              </p>
              {orders.length === 0 && (
                <button 
                  className="btn btn-primary btn-lg px-4 d-inline-flex align-items-center gap-2"
                  onClick={() => navigate("/")}
                >
                  <FaArrowLeft /> Start Shopping
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Orders List */
          <div className="row g-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="col-12">
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden order-card">
                  {/* Order Header */}
                  <div className="order-header px-4 py-3">
                    <div className="row align-items-center">
                      <div className="col-lg-3 col-md-4 mb-3 mb-md-0">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <FaReceipt className="text-primary" />
                          <h6 className="mb-0 fw-bold">Order #{order._id?.slice(-8)}</h6>
                        </div>
                        <small className="text-muted">
                          Placed: {formatDateTime(order.createdAt)}
                        </small>
                      </div>
                      
                      <div className="col-lg-2 col-md-3 col-6 text-center mb-3 mb-lg-0">
                        <small className="text-muted d-block mb-1">Order Status</small>
                        <span className={`status-badge ${getStatusBadgeClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      
                      <div className="col-lg-2 col-md-3 col-6 text-center mb-3 mb-lg-0">
                        <small className="text-muted d-block mb-1">Payment</small>
                        <span className={`status-badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                        <small className="d-block text-muted mt-1">
                          <FaCreditCard className="me-1" />
                          {order.paymentMethod}
                        </small>
                      </div>
                      
                      <div className="col-lg-3 col-md-6 text-center mb-3 mb-lg-0">
                        <h4 className="mb-0 text-primary fw-bold">₹{order.totalPrice}</h4>
                        <small className="text-muted">{order.items?.length} items</small>
                      </div>
                      
                      <div className="col-lg-2 col-md-6 text-center">
                        <button 
                          className="btn btn-outline-primary px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2"
                          onClick={() => handleTrackOrder(order._id)}
                        >
                          <FaEye /> Track
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    {/* Order Items */}
                    <div className="mb-4">
                      <h6 className="border-bottom pb-2 mb-3 d-flex align-items-center gap-2 fw-bold">
                        <FaBox className="text-primary" /> 
                        Items ({order.items?.length})
                      </h6>
                      
                      <div className="row g-3">
                        {order.items?.map((item, index) => (
                          <div key={`${item.product?._id}-${index}`} className="col-lg-3 col-md-6">
                            <div className="item-card rounded-3 p-3 h-100">
                              <div className="d-flex gap-3">
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.product?.images?.[0] || "/placeholder-image.jpg"}
                                    alt={item.product?.name || "Product"}
                                    className="rounded"
                                    style={{ width: "60px", height: "60px", objectFit: "contain" }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/placeholder-image.jpg";
                                    }}
                                  />
                                </div>
                                <div className="flex-grow-1 min-width-0">
                                  <h6 className="mb-1 text-truncate" title={item.product?.name}>
                                    {item.product?.name || "Product Name"}
                                  </h6>
                                  <small className="text-muted d-flex align-items-center gap-1 mb-1">
                                    <FaStore /> {item.seller?.businessName || item.seller?.name || "Seller"}
                                  </small>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="badge bg-light text-dark border">Qty: {item.quantity}</span>
                                    <strong className="text-primary">₹{item.price}</strong>
                                  </div>
                                  <div className="mt-2">
                                    <small className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                                      {item.status}
                                    </small>
                                  </div>
                                  {item.deliveryDate && (
                                    <small className="text-success d-block mt-1">
                                      Delivered: {formatDate(item.deliveryDate)}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address and Summary Row */}
                    <div className="row g-4">
                      {/* Shipping Address */}
                      <div className="col-lg-6">
                        <div className="bg-light rounded-3 p-4 h-100">
                          <h6 className="mb-3 d-flex align-items-center gap-2 fw-bold">
                            <FaMapMarkerAlt className="text-primary" /> Shipping Address
                          </h6>
                          <address className="mb-0">
                            <strong className="d-block mb-2">{order.shippingAddress?.name}</strong>
                            <div className="text-muted small lh-lg">
                              {order.shippingAddress?.addressLine}<br />
                              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                              {order.shippingAddress?.country}<br />
                              <div className="mt-2">
                                <FaPhone className="me-2" /> {order.shippingAddress?.phone}
                              </div>
                            </div>
                          </address>
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="col-lg-6">
                        <div className="bg-light rounded-3 p-4 h-100">
                          <h6 className="mb-3 d-flex align-items-center gap-2 fw-bold">
                            <FaRupeeSign className="text-primary" /> Order Summary
                          </h6>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Shipping Charge:</span>
                            <span className="fw-semibold">₹{order.shippingCharge || 0}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="d-flex justify-content-between mb-2">
                              <span>Discount:</span>
                              <span className="fw-semibold text-success">-₹{order.discount}</span>
                            </div>
                          )}
                          {order.couponCode && (
                            <div className="d-flex justify-content-between mb-2">
                              <span className="d-flex align-items-center gap-1">
                                <FaGift className="text-success" /> Coupon Applied:
                              </span>
                              <span className="fw-semibold text-success">{order.couponCode}</span>
                            </div>
                          )}
                          <hr />
                          <div className="d-flex justify-content-between mb-3">
                            <span className="fw-bold fs-5">Total Amount:</span>
                            <span className="fw-bold fs-5 text-primary">₹{order.totalPrice}</span>
                          </div>
                          {order.expectedDeliveryDate && (
                            <div className="alert alert-info py-2 px-3 mb-0">
                              <small className="d-flex align-items-center gap-2">
                                <FaCalendarAlt /> Expected Delivery: <strong>{formatDate(order.expectedDeliveryDate)}</strong>
                              </small>
                            </div>
                          )}
                          {order.paymentId && (
                            <div className="mt-2 pt-2 border-top">
                              <small className="text-muted">
                                <strong>Payment ID:</strong> {order.paymentId}
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default MyOrders;