import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Subscribe from './pages/Subscribe';
import Charities from './pages/Charities';
import CharityDetail from './pages/CharityDetail';

// Dashboard Pages
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Scores from './pages/dashboard/Scores';
import Draws from './pages/dashboard/Draws';
import Winnings from './pages/dashboard/Winnings';
import Profile from './pages/dashboard/Profile';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminDraws from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners from './pages/admin/AdminWinners';
import AdminReports from './pages/admin/AdminReports';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Home /><Footer /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/subscribe" element={<><Subscribe /><Footer /></>} />
          <Route path="/charities" element={<><Charities /><Footer /></>} />
          <Route path="/charities/:id" element={<><CharityDetail /><Footer /></>} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="scores" element={<Scores />} />
            <Route path="draws" element={<Draws />} />
            <Route path="winnings" element={<Winnings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminLayout /></AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="draws" element={<AdminDraws />} />
            <Route path="charities" element={<AdminCharities />} />
            <Route path="winners" element={<AdminWinners />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
