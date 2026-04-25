import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import SourcesPage from './pages/SourcesPage';
import ScannerPage from './pages/ScannerPage';
import DashboardPage from './pages/DashboardPage';
import DuplicatesPage from './pages/DuplicatesPage';
import SimilarImages from './pages/SimilarImages';
import LowQualityPage from './pages/LowQualityPage';
import TrashBinPage from './pages/TrashBinPage';
import JunkFilesPage from './pages/JunkFilesPage';
import LargeFilesPage from './pages/LargeFilesPage';
import SustainabilityPage from './pages/SustainabilityPage';
import StorageInsights from './pages/StorageInsights';
import AnalyticsPage from './pages/AnalyticsPage';
import Settings from './pages/Settings';

// Auth
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MilestonesPage from './pages/MilestonesPage';
import ProtectedRoute from './components/ProtectedRoute';

// Other
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />

        {/* App Shell Routes (Protected) */}
        <Route path="/sources" element={<ProtectedRoute><SourcesPage /></ProtectedRoute>} />
        <Route path="/scanner" element={<ProtectedRoute><ScannerPage /></ProtectedRoute>} />

        {/* Dashboard Pages (Using Flat Routing) */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
          <Route path="/duplicates" element={<DuplicatesPage />} />
          <Route path="/similar-images" element={<SimilarImages />} />
          <Route path="/low-quality" element={<LowQualityPage />} />
          <Route path="/junk" element={<JunkFilesPage />} />
          <Route path="/large-files" element={<LargeFilesPage />} />
          <Route path="/insights" element={<StorageInsights />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/sustainability" element={<SustainabilityPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/trash" element={<TrashBinPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </AuthProvider>
  </Router>
  );
}

export default App;
