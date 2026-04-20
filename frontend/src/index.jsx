import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import FixedNavigation from "./components/navigation/FixedNavigation.jsx";

const ensureMatchMediaCompat = () => {
  if (typeof window === "undefined" || window.__NOOS_MATCH_MEDIA_COMPAT__) return;

  const createFallbackMql = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });

  if (typeof window.matchMedia !== "function") {
    window.matchMedia = (query) => createFallbackMql(query);
    return;
  }

  const originalMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query) => {
    let result;

    try {
      result = originalMatchMedia(query) ?? createFallbackMql(query);
    } catch (error) {
      result = createFallbackMql(query);
    }

    if (typeof result.addListener !== "function") {
      result.addListener = (listener) => {
        if (typeof result.addEventListener === "function") {
          result.addEventListener("change", listener);
        }
      };
    }

    if (typeof result.removeListener !== "function") {
      result.removeListener = (listener) => {
        if (typeof result.removeEventListener === "function") {
          result.removeEventListener("change", listener);
        }
      };
    }

    if (typeof result.addEventListener !== "function") {
      result.addEventListener = () => {};
    }

    if (typeof result.removeEventListener !== "function") {
      result.removeEventListener = () => {};
    }

    if (typeof result.dispatchEvent !== "function") {
      result.dispatchEvent = () => false;
    }

    if (typeof result.matches !== "boolean") {
      result.matches = false;
    }

    if (typeof result.media !== "string") {
      result.media = query;
    }

    return result;
  };

  window.__NOOS_MATCH_MEDIA_COMPAT__ = true;
};

ensureMatchMediaCompat();

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
