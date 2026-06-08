import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FixedNavigation from "./components/navigation/FixedNavigation.jsx";
import { PUBLIC_BASE_URL } from "./lib/env";

const NoosRootPage = lazy(() => import("./pages/root/NoosRootPage.jsx"));
const AboutUsPage = lazy(() => import("./pages/about/AboutUsPage.jsx"));
const AIObjetPage = lazy(() => import("./pages/ai-objet/AIObjetPage.jsx"));
const SolarExplorerPage = lazy(() => import("./pages/solar/SolarExplorerPage.jsx"));
const SpaceTravelPage = lazy(() => import("./pages/solar/SpaceTravelPage.jsx"));
const MyProfilePage = lazy(() => import("./pages/solar/MyProfilePage.jsx"));
const TravelRecordsPage = lazy(() => import("./pages/solar/TravelRecordsPage.jsx"));
const TravelRecordDetailPage = lazy(() => import("./pages/solar/TravelRecordDetailPage.jsx"));

const BASENAME = import.meta.env.PROD ? PUBLIC_BASE_URL : "";
const ROUTE_FALLBACK_STYLE = Object.freeze({
  width: "100%",
  height: "100vh",
  backgroundColor: "#000000",
});

const RouteFallback = () => <div style={ROUTE_FALLBACK_STYLE} />;

const LazyRoute = ({ children }) => (
  <Suspense fallback={<RouteFallback />}>{children}</Suspense>
);

export default function App() {
  return (
    <Router basename={BASENAME}>
      <FixedNavigation />
      <Routes>
        <Route
          path="/"
          element={(
            <LazyRoute>
              <NoosRootPage />
            </LazyRoute>
          )}
        />
        <Route
          path="/about"
          element={(
            <LazyRoute>
              <AboutUsPage />
            </LazyRoute>
          )}
        />
        <Route
          path="/ai-objet"
          element={(
            <LazyRoute>
              <AIObjetPage />
            </LazyRoute>
          )}
        />
        <Route
          path="/solar-explorer"
          element={(
            <LazyRoute>
              <SolarExplorerPage />
            </LazyRoute>
          )}
        />
        <Route
          path="/solar-explorer/"
          element={(
            <LazyRoute>
              <SolarExplorerPage />
            </LazyRoute>
          )}
        />
        <Route
          path="/space-travel"
          element={(
            <LazyRoute>
              <SpaceTravelPage />
            </LazyRoute>
          )}
        />
        <Route
          path="/my-profile"
          element={(
            <LazyRoute>
              <MyProfilePage />
            </LazyRoute>
          )}
        />
        <Route
          path="/travel-records"
          element={(
            <LazyRoute>
              <TravelRecordsPage />
            </LazyRoute>
          )}
        />
        <Route
          path="/travel-records/:recordId"
          element={(
            <LazyRoute>
              <TravelRecordDetailPage />
            </LazyRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/?main=true" replace />} />
      </Routes>
    </Router>
  );
}
