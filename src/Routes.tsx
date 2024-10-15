import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProductViewAll from "./components/Products/ProductViewall";
import { Loader } from "./components/shared";
import { Error404, Home } from "./pages";
import ResetPassword from "./components/auth/ResetPass";

const ProductView = React.lazy(() => import("./pages/ProductView"));

const AppWithRouting = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout component={<Home />} />} />
      <Route path="/ResetPassword" element={<ResetPassword />} />
      <Route
        path="/products/shop/:shopId"
        element={<Layout component={<ProductViewAll />} />}
      />
      <Route
        path="/products/category"
        element={
          <Layout component={<ProductViewAll />} />
        }
      />
      <Route
        path="/prn/:name/prid/:id"
        element={
          <Suspense fallback={<Loader fullscreen />}>
            <Layout component={<ProductView />} />
          </Suspense>
        }
      />
      <Route
        path="/not-found"
        element={<Layout noFooter={true} component={<Error404 />} />}
      />
      <Route
        path="*"
        element={<Layout noFooter={true} component={<Error404 />} />}
      />
    </Routes>
  );
};

export default AppWithRouting;
