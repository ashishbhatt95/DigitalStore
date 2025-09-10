import React from "react";
import { Route, Routes } from "react-router-dom";
import Cart from "./Customer/Cart";
import Checkout from "./Customer/Checkout";
import MyOrders from "./Customer/MyOrders";

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/myorders" element={<MyOrders />} />
      
    </Routes>
  );
};

export default CustomerRoutes;