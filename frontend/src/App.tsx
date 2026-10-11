import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { AvailableFoodPage } from './pages/AvailableFoodPage';
import { RouteMapPage } from './pages/RouteMapPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { RecipientDashboard } from './pages/RecipientDashboard';
import { VolunteerDashboard } from './pages/VolunteerDashboard';

// Helper component to redirect authenticated users to their specific dashboard
const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'DONOR':
      return <Navigate to="/donor" replace />;
    case 'RECIPIENT':
      return <Navigate to="/recipient" replace />;
    case 'VEHICLE_VOLUNTEER':
      return <Navigate to="/volunteer" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

// 404 Not Found Page
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] bg-nourish-cream flex flex-col items-center justify-center text-center px-4">
      <span className="text-6xl font-serif font-bold text-nourish-forest mb-2">404</span>
      <h2 className="text-2xl font-serif font-bold text-nourish-dark mb-2">Page Not Found</h2>
      <p className="text-sm text-nourish-muted max-w-md mb-6">
        The page you are looking for does not exist or has been moved within the NourishNet network.
      </p>
      <a
        href="/"
        className="px-6 py-2.5 bg-nourish-primary text-white text-sm font-semibold rounded-xl hover:bg-nourish-forest transition-colors shadow-sm"
      >
        Return to Homepage
      </a>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-nourish-cream text-nourish-dark font-sans selection:bg-nourish-primary selection:text-white">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/available-food" element={<AvailableFoodPage />} />
              <Route path="/route-map" element={<RouteMapPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Dynamic Dashboard Redirect */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Role-Specific Protected Routes */}
              <Route
                path="/donor/*"
                element={
                  <ProtectedRoute allowedRoles={['DONOR']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recipient/*"
                element={
                  <ProtectedRoute allowedRoles={['RECIPIENT']}>
                    <RecipientDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/volunteer/*"
                element={
                  <ProtectedRoute allowedRoles={['VEHICLE_VOLUNTEER']}>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
