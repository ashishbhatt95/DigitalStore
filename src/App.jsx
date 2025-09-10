import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { ContextApi } from "./Component/common/Context_Api";
import ProtectedRoute from "./Component/common/ProtectedRoute"; 

import Header from "./Component/common/Header";
import Home from "./Component/common/Home";
import Footer from "./Component/common/Footer";
import Login from "./Component/auth/Login";
import ForgotResetPassword from "./Component/auth/ForgotResetPassword";

import MobilesSummerypage from "./Component/Navbar/MobilesSummerypage";
import TvSummery from "./Component/Navbar/TvSummery";
import Smartwatchform from "./Component/Navbar/SmartWacthform";
import Laptops from "./Component/Navbar/Laptops";
import Books from "./Component/Navbar/Books";
import Fashion from "./Component/Navbar/Fashion";
import Computer from "./Component/Navbar/Computer";
import Electronic from "./Component/Navbar/Electronic";

import AdminRoutes from "./Component/AdminRoutes";
import CustomerRoutes from "./Component/CustomerRoutes";
import SellerRoutes from "./Component/SellerRoutes";
import SeeMore from "./Component/common/SeeMore";
import ProductDetails from "./Component/common/ProductDetails";
import AllProductList from "./Component/common/AllProductList";
import CustomerCreateAccount from "./Component/Customer/CustomerCreateAccount";
import BussinessRegister from "./Component/Seller/BussinessRegister"
import NetworkStatus from "./Component/common/NetworkStatus"

const Layout = ({ children }) => {
  const location = useLocation();
  const showLayout = location.pathname === "/" || location.pathname.startsWith("/productsDetails");

  return (
    <>
      {showLayout && <Header />}
      <main>{children}</main>
      {showLayout && <Footer />}
    </>
  );
};

function App() {
  const [cart, setCart] = useState("");
  const [loginname, setLoginName] = useState(localStorage.getItem("loginname"));
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <ContextApi.Provider value={{ loginname, setLoginName, cart, setCart, token, setToken }}>
      <Router>
      <NetworkStatus />
        
        <Layout>
      
          <Routes>
         
            <Route path="/" element={<Home />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/ForgotPassword" element={<ForgotResetPassword />} />

         
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']} />} >
              <Route path="*" element={<AdminRoutes />} />
            </Route>

            <Route path="/seller/*" element={<ProtectedRoute allowedRoles={['seller']} />} >
              <Route path="*" element={<SellerRoutes />} />
            </Route>

            <Route path="/customer/*" element={<ProtectedRoute allowedRoles={['customer']} />} >
              <Route path="*" element={<CustomerRoutes />} />
            </Route>

            {/* Product Category Routes */}
            <Route path="/Mobile" element={<ProtectedRoute allowedRoles={['admin', 'customer']} />} >
              <Route path="" element={<MobilesSummerypage />} />
            </Route>

            <Route path="/Tv" element={<ProtectedRoute allowedRoles={['admin', 'customer']} />} >
              <Route path="" element={<TvSummery />} />
            </Route>

            <Route path="/SmartWatch" element={<ProtectedRoute allowedRoles={['admin', 'customer']} />} >
              <Route path="" element={<Smartwatchform />} />
            </Route>

            <Route path="/Laptop" element={<ProtectedRoute allowedRoles={['admin', 'customer']} />} >
              <Route path="" element={<Laptops />} />
            </Route>

            <Route path="/Books" element={<ProtectedRoute allowedRoles={['admin', 'customer']} />} >
              <Route path="" element={<Books />} />
            </Route>

            <Route path="/fashion" element={<ProtectedRoute allowedRoles={['admin', 'customer']} />} >
              <Route path="" element={<Fashion />} />
            </Route>

            <Route path="/Computer" element={<ProtectedRoute allowedRoles={['admin', 'customer']} />} >
              <Route path="" element={<Computer />} />
            </Route>

            <Route path="/electronic" element={<ProtectedRoute allowedRoles={['admin', 'customer']} />} >
              <Route path="" element={<Electronic />} />
            </Route>

            {/* ✅ New SeeMore Route */}
            <Route path="/see-more/:category" element={<SeeMore />} />
            <Route path="/product/:productId" element={<ProductDetails/>} />
            <Route path="/" element={<AllProductList/>} />
            <Route path="/CustomerAccount" element={<CustomerCreateAccount/>} />
            <Route path="/BussinessRegister" element={<BussinessRegister/>} />
            
         </Routes>
        
        </Layout>
      </Router>
    </ContextApi.Provider>
  );
}

export default App;