import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Requests from './pages/Requests';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AssetInventory from './pages/admin/AssetInventory';
import AssetTimeline from './pages/admin/AssetTimeline';
import RequestsQueue from './pages/admin/RequestsQueue';
import EmployeeMatrix from './pages/admin/EmployeeMatrix';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to dashboard if unauthorized
  }

  return children;
};

const IndexRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Root Redirect */}
        <Route path="/" element={<IndexRedirect />} />

        {/* Employee Protected Routes */}
        <Route path="/employee" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="requests" element={<Requests />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="inventory" element={<AssetInventory />} />
          <Route path="inventory/:id" element={<AssetTimeline />} />
          <Route path="requests" element={<Requests />} />
          <Route path="staff" element={<EmployeeMatrix />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
