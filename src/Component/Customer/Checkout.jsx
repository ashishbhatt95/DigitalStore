import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaTruck, FaMoneyBillWave, FaCreditCard, FaWallet, FaLock } from "react-icons/fa";
import Header from '../common/Header';
import Footer from '../common/Footer';

const CheckoutController = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // default COD

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    setLoading(true);
    const token = getToken();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.cart && Array.isArray(data.cart.items) && data.cart.items.length > 0) {
        setCartItems(data.cart.items);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Price calculation
  const totalProductPrice = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const shippingCharge = totalProductPrice > 1000 ? 0 : 50;
  const finalPrice = totalProductPrice + shippingCharge - discount;

  // Coupon logic
  const applyCoupon = () => {
    if (!couponCode) return;

    if (couponCode.toUpperCase() === "SAVE10") {
      const discountAmount = Math.round(totalProductPrice * 0.1);
      setDiscount(discountAmount);
      setCouponApplied(true);
      alert("Coupon applied successfully!");
    } else {
      alert("Invalid coupon code");
      setCouponCode("");
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setCouponCode("");
    setDiscount(0);
  };

  // Shipping Address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatAddress = () => {
    const { fullName, street, area, city, state, pincode, phone } = shippingAddress;
    return {
      name: fullName,
      phone,
      addressLine: `${street}, ${area}`,
      city,
      state,
      postalCode: pincode,
      country: "India"
    };
  };

  // Place Order
  const handlePlaceOrder = async () => {
    const token = getToken();
    if (!token) {
      alert("Please login to place an order");
        window.location.href = "/";
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city) {
      alert("Please fill required shipping details");
      return;
    }

    setProcessingPayment(true);

    try {
      // Map frontend paymentMethod to backend enum
      let backendPaymentMethod;
      switch(paymentMethod) {
        case "upi":
        case "card":
          backendPaymentMethod = "Wallet"; // for now treat all online payments as Wallet
          break;
        case "cod":
          backendPaymentMethod = "COD";
          break;
        default:
          backendPaymentMethod = "Wallet";
      }

      const orderData = {
        shippingAddress: formatAddress(),
        paymentMethod: backendPaymentMethod,
        shippingCharge,
        couponCode: couponApplied ? couponCode : null,
        discount,
        expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        paymentId: backendPaymentMethod === "COD" ? null : "DUMMY_PAYMENT_ID"
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/customer/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log("Cart API Response:", data);

      if (response.ok) {
        alert("Order placed successfully!");
        window.location.href = "/";
      } else {
        throw new Error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container my-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading checkout information...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container my-4">
        <h2 className="mb-4">Checkout</h2>
        <div className="row">
          <div className="col-md-8">
            {/* Shipping Address */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaMapMarkerAlt className="me-2 text-primary" />
                  Shipping Address
                </h5>
              </div>
              <div className="card-body">
                <form>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="fullName" 
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="phone" 
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Street Address</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="street" 
                      value={shippingAddress.street}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Area/Locality</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="area" 
                      value={shippingAddress.area}
                      onChange={handleAddressChange}
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-4">
                      <label className="form-label">City</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="city" 
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">State</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="state" 
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Pincode</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="pincode" 
                        value={shippingAddress.pincode}
                        onChange={handleAddressChange}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Items */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Order Items ({cartItems.length})</h5>
              </div>
              <div className="card-body">
                {cartItems.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No items in cart. Please add items before checkout.</p>
                    <a href="/" className="btn btn-primary">Continue Shopping</a>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={index} className="d-flex mb-3 pb-3 border-bottom">
                      <div className="me-3" style={{ width: "70px", height: "70px" }}>
                        <img
                          src={item.product?.images?.[0] || "/placeholder-image.jpg"}
                          alt={item.product?.name}
                          className="img-fluid rounded"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder-image.jpg"; }}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.product?.name}</h6>
                        <p className="mb-1 text-muted small">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-end">
                        <strong>₹{item.product?.price}</strong>
                        <p className="mb-0 text-muted small">Total: ₹{item.product?.price * item.quantity}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Payment Method</h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <label className="form-check-label" htmlFor="cod">
                    <FaMoneyBillWave className="me-2" />
                    Cash on Delivery
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                  />
                  <label className="form-check-label" htmlFor="upi">
                    <FaWallet className="me-2" />
                    UPI / Wallet
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  <label className="form-check-label" htmlFor="card">
                    <FaCreditCard className="me-2" />
                    Credit / Debit Card
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Items Total</span>
                  <span>₹{totalProductPrice}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  {shippingCharge === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    <span>₹{shippingCharge}</span>
                  )}
                </div>

                {/* Coupon Section */}
                <div className="mb-3 mt-3">
                  {!couponApplied ? (
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={applyCoupon}
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-success fw-bold">
                          {couponCode.toUpperCase()} applied
                        </span>
                        <p className="mb-0 small text-muted">
                          You saved ₹{discount}
                        </p>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={removeCoupon}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {discount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <hr />
                <div className="d-flex justify-content-between mb-3 fw-bold">
                  <span>Total Amount</span>
                  <span>₹{finalPrice}</span>
                </div>

                {totalProductPrice > 1000 && (
                  <div className="alert alert-success py-2 mb-3 small">
                    <FaTruck className="me-2" />
                    Free shipping on orders above ₹1000
                  </div>
                )}
                
                <button
                  className="btn btn-primary w-100 py-2"
                  disabled={processingPayment || cartItems.length === 0}
                  onClick={handlePlaceOrder}
                >
                  {processingPayment ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaLock className="me-2" />Place Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutController;
