// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import './services/i18n';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// Pages
import HomePage from './pages/HomePage/HomePage';
import Register from './pages/Register/Register';
import Login from './pages/Login/Login';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import ManageURLs from './pages/ManageURLs/ManageURLs';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import AnalyticsPage from './pages/AnalyticsPage/AnalyticsPage';
import RedirectPage from './pages/RedirectPage/RedirectPage';

// New Static Pages (adjust paths if needed)
import AboutPage from './pages/StaticPage/AboutPage.jsx';
import PrivacyPolicy from './pages/StaticPage/PrivacyPolicy.jsx';
import TermsOfService from './pages/StaticPage/TermsOfService.jsx';
import ProductsPage from './pages/StaticPage/ProductsPage.jsx';

// Layout component that includes Header and Footer
const MainLayout = () => (
  <>
    <Header />
    <main className="main-content">
      <Outlet />
    </main>
    <Footer />
  </>
);

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Analytics Route
const PublicAnalyticsRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return children;
};

function AppContent() {
  return (
    <div className="App">
      <Routes>
        {/* All pages with header/footer are nested inside MainLayout */}
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* New static pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/products" element={<ProductsPage />} />

          {/* Analytics (public with restrictions) */}
          <Route
            path="/analytics"
            element={
              <PublicAnalyticsRoute>
                <AnalyticsPage />
              </PublicAnalyticsRoute>
            }
          />

          {/* Analytics for specific URL (must come before /:alias) */}
          <Route
            path="/:alias/analytics"
            element={
              <PublicAnalyticsRoute>
                <AnalyticsPage />
              </PublicAnalyticsRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage"
            element={
              <ProtectedRoute>
                <ManageURLs />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirect page – no header/footer */}
        <Route path="/:alias" element={<RedirectPage />} />

        {/* Catch all – redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: 'green',
                    secondary: 'black',
                  },
                },
                error: {
                  duration: 5000,
                },
              }}
            />
            <AppContent />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;