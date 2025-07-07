import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/orders" replace />} />
              <Route path="orders/*" element={<div>Orders Component</div>} />
              <Route 
                path="inventory/*" 
                element={
                  <PrivateRoute roles={['pos_operator', 'admin']}>
                    <div>Inventory Component</div>
                  </PrivateRoute>
                } 
              />
              <Route 
                path="products/*" 
                element={
                  <PrivateRoute roles={['pos_operator', 'admin']}>
                    <div>Products Component</div>
                  </PrivateRoute>
                } 
              />
              <Route path="profile" element={<div>Profile Component</div>} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
