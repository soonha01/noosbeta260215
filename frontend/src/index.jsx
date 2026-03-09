import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import FixedNavigation from "./components/navigation/FixedNavigation.jsx";

const App = lazy(() => import("./App.jsx"));
const AboutUs = lazy(() => import("./components/sections/AboutUs.jsx"));
const SolarExplorer = lazy(() => import("./components/features/solar/SolarExplorer.jsx"));
const SpaceTravel = lazy(() => import("./components/features/solar/SpaceTravel.jsx"));

const root = ReactDOM.createRoot(document.getElementById("root"));

// Compute a basename that works in dev and prod.
const BASENAME = process.env.NODE_ENV === 'production' ? (process.env.PUBLIC_URL || '') : '';
const ROUTE_FALLBACK_STYLE = Object.freeze({
  width: "100%",
  height: "100vh",
  backgroundColor: "#000000",
});

const RouteFallback = () => <div style={ROUTE_FALLBACK_STYLE} />;

const LazyRoute = ({ children }) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

root.render(
  <React.StrictMode>
    <Router basename={BASENAME}>
      <FixedNavigation />
      <Routes>
        <Route
          path="/"
          element={(
            <LazyRoute>
              <App />
            </LazyRoute>
          )}
        />
        <Route
          path="/about"
          element={(
            <LazyRoute>
              <AboutUs />
            </LazyRoute>
          )}
        />
        <Route
          path="/solar-explorer"
          element={(
            <LazyRoute>
              <SolarExplorer />
            </LazyRoute>
          )}
        />
        <Route
          path="/solar-explorer/"
          element={(
            <LazyRoute>
              <SolarExplorer />
            </LazyRoute>
          )}
        />
        <Route
          path="/space-travel"
          element={(
            <LazyRoute>
              <SpaceTravel />
            </LazyRoute>
          )}
        />
        {/* Fallback: always go to canonical Solar Explorer */}
        <Route path="*" element={<Navigate to="/solar-explorer" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
