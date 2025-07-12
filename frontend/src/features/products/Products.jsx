import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user } = useAuth();
  const apiUrl = 'http://localhost:3000';

  // Configure axios defaults
  axios.defaults.baseURL = apiUrl;
  if (user?.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
  }

  const fetchProducts = useCallback(async () => {
    try {
      console.log('Fetching products from:', `${apiUrl}/api/products`);
      const response = await axios.get(`${apiUrl}/api/products`);
      console.log('Response:', response);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock'), 10),
      status: formData.get('status') || 'available'
    };

    try {
      if (selectedProduct) {
        await axios.put(`${apiUrl}/api/products/${selectedProduct._id}`, productData);
      } else {
        await axios.post(`${apiUrl}/api/products`, productData);
      }
      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving product:', error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product._id}
                hover
                onClick={() => handleProductClick(product)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedProduct ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                name="name"
                label="Product Name"
                required
                fullWidth
                defaultValue={selectedProduct?.name || ''}
              />
              <TextField
                name="description"
                label="Description"
                required
                fullWidth
                multiline
                rows={3}
                defaultValue={selectedProduct?.description || ''}
              />
              <TextField
                name="category"
                label="Category"
                required
                fullWidth
                defaultValue={selectedProduct?.category || ''}
              />
              <TextField
                name="price"
                label="Price"
                required
                type="number"
                fullWidth
                defaultValue={selectedProduct?.price || ''}
                inputProps={{ step: '0.01' }}
              />
              <TextField
                name="stock"
                label="Stock"
                required
                type="number"
                fullWidth
                defaultValue={selectedProduct?.stock || ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Products;
