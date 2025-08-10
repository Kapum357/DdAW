import React from 'react';
import ProductsAdmin from './ProductsAdmin';

function Admin() {
  return (
    <div className='main'>
      <h2>Admin</h2>
      <p>Panel de administración.</p>
      <ProductsAdmin />
    </div>
  );
}

export default Admin;
