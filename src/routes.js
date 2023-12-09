import React from "react";
import { Route, Routes } from "react-router-dom";
import { Details, Home } from "./pages";

const RoutesApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route exact path="/produto/:name" element={<Details />} />
    </Routes>
  );
};

export default RoutesApp;
