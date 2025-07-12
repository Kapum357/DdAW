import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Orders from './features/orders/Orders';
import Products from './features/products/Products';
import Inventory from './features/inventory/Inventory';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router basename="/DdAW">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Add this explicit route for the root path */}
            <Route index element={<Navigate to="/login" replace />} />
            
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/orders" replace />} />
              <Route path="orders/*" element={<Orders />} />
              <Route 
                path="inventory/*" 
                element={
                  <PrivateRoute roles={['pos_operator', 'admin']}>
                    <Inventory />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="products/*" 
                element={
                  <PrivateRoute roles={['pos_operator', 'admin']}>
                    <Products />
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
