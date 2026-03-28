// WORKING VERSION WITH INLINE STYLES
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPageDirect from './components/LandingPageDirect';
import Login from './components/Login';
import Signup from './components/Signup';
import DashboardWrapper from './components/DashboardWrapper';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPageDirect />} />
        
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardWrapper />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 - Redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
