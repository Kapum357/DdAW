

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Tables from './pages/Tables';
import Login from './pages/Login';
import './App.css';

import { isAuthenticated } from './services/authService';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Login />;
}


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path='/products' element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path='/orders' element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path='/tables' element={<PrivateRoute><Tables /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
