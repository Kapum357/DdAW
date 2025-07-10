import { useState, useCallback } from 'react';
import axios from 'axios';
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
  Chip,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../../context/auth';
import OrderDetailsDialog from '../../components/orders/OrderDetailsDialog';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${apiUrl}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [user, apiUrl]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${apiUrl}/api/orders/${orderId}`, { status: newStatus });
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleAddComment = async (orderId, comment) => {
    try {
      await axios.post(`${apiUrl}/api/orders/${orderId}/comments`, { comment });
      await fetchOrders();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    return (
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Order
        </Button>
      </Box>

      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search orders by ID, customer, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Service Point</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow
                key={order._id}
                hover
                onClick={() => handleOrderClick(order)}
                sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.user?.username}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                <TableCell>{order.servicePoint}</TableCell>
                <TableCell align="right">${order.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <OrderDetailsDialog
        open={openDialog}
        onClose={handleCloseDialog}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onAddComment={handleAddComment}
      />
    </Box>
  );
};

export default Orders;
