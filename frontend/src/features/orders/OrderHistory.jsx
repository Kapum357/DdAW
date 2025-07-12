import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Collapse,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Replay as ReorderIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/auth';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  useAuth();
  const navigate = useNavigate();
  const apiUrl = 'https://backend-kapum357s-projects.vercel.app';

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/orders/history`);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching order history');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleReorder = async (order) => {
    try {
      // Create a new order with the same items
      const response = await axios.post(`${apiUrl}/api/orders`, {
        items: order.items.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        servicePoint: order.servicePoint
      });

      // Navigate to the new order
      navigate(`/orders/${response.data._id}`);
    } catch (err) {
      setError('Error creating reorder');
      console.error('Error:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'processing': return 'info';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Order History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {orders.map((order) => (
        <Card key={order._id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1">
                  Order #{order._id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Chip
                  label={order.status.toUpperCase()}
                  color={getStatusColor(order.status)}
                  size="small"
                />
                <Typography variant="subtitle1">
                  ${order.total.toFixed(2)}
                </Typography>
                <IconButton
                  onClick={() => setExpandedOrderId(
                    expandedOrderId === order._id ? null : order._id
                  )}
                  size="small"
                >
                  {expandedOrderId === order._id ? 
                    <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expandedOrderId === order._id}>
              <Box mt={2}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            ${item.price.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            ${(item.quantity * item.price).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box mt={2} display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Service Point: {order.servicePoint}
                  </Typography>
                  <Button
                    startIcon={<ReorderIcon />}
                    onClick={() => handleReorder(order)}
                    disabled={order.status === 'cancelled'}
                  >
                    Reorder
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default OrderHistory;
