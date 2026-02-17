import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LandingPage from './pages/LandingPage';
import DJLogin from './pages/DJLogin';
import DJDashboard from './pages/DJDashboard';
import CreateEvent from './pages/CreateEvent';
import DJLiveView from './pages/DJLiveView';
import AttendeeRequest from './pages/AttendeeRequest';
import Analytics from './pages/Analytics';
import BlockList from './pages/BlockList';
import SongRankings from './pages/SongRankings';
import EditEvent from './pages/EditEvent';

// Protected route wrapper for DJ routes
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<DJLogin />} />
          <Route path="/event/:slug" element={<AttendeeRequest />} />

          {/* Protected DJ Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DJDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dj/event/:slug"
            element={
              <ProtectedRoute>
                <DJLiveView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/:slug"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blocklist"
            element={
              <ProtectedRoute>
                <BlockList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dj/event/:slug/edit"
            element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dj/event/:slug/rankings"
            element={
              <ProtectedRoute>
                <SongRankings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
