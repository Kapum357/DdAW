import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Pedidos from './pages/Pedidos';
import Tables from './pages/Tables';
import Mesas from './pages/Mesas';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Menu from './pages/Menu';
import MenuCliente from './pages/MenuCliente';

import RegistroCliente from './pages/RegistroCliente';
import RegistroUsuario from './pages/RegistroUsuario';
import './App.css';

import { isAuthenticated } from './services/authService';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Login />;
}



function PublicOnlyRoute({ children }) {
  return !isAuthenticated() ? children : <Home />;
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path='/products' element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path='/orders' element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path='/tables' element={<PrivateRoute><Tables /></PrivateRoute>} />
        <Route path='/pedidos' element={<PrivateRoute><Pedidos /></PrivateRoute>} />
        <Route path='/menu' element={<PrivateRoute><Menu /></PrivateRoute>} />
        <Route path='/menu-cliente' element={<MenuCliente />} />
        <Route path='/mesas' element={<PrivateRoute><Mesas /></PrivateRoute>} />
        <Route path='/admin' element={<PrivateRoute><Admin /></PrivateRoute>} />
  <Route path='/registro-cliente' element={<PublicOnlyRoute><RegistroCliente /></PublicOnlyRoute>} />
  <Route path='/registro-usuario' element={<PublicOnlyRoute><RegistroUsuario /></PublicOnlyRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
