import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Divider,
  TextField,
  MenuItem,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import OrderTimeline from './OrderTimeline';
import { useAuth } from '../../context/auth';
import { useState } from 'react';

const OrderDetailsDialog = ({
  open,
  onClose,
  order,
  onStatusChange,
  onAddComment
}) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const canChangeStatus = ['pos_operator', 'admin'].includes(user?.role);
  const canAddComment = true; // All authenticated users can comment

  const handleStatusChange = async () => {
    if (newStatus && newStatus !== order.status) {
      await onStatusChange(order._id, newStatus);
      setNewStatus('');
    }
  };

  const handleAddComment = async () => {
    if (comment.trim()) {
      await onAddComment(order._id, comment.trim());
      setComment('');
    }
  };

  if (!order) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '60vh' }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Order #{order._id}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Order Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Order Information
            </Typography>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Customer: {order.user?.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Service Point: {order.servicePoint}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Items
            </Typography>
            <Box sx={{ mb: 3 }}>
              {order.items.map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    {item.product.name} x {item.quantity}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${item.price.toFixed(2)} each
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1">
                Total: ${order.total.toFixed(2)}
              </Typography>
            </Box>

            {/* Status Change Section */}
            {canChangeStatus && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Update Status
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      select
                      fullWidth
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      size="small"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!newStatus || newStatus === order.status}
                      onClick={handleStatusChange}
                    >
                      Update
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Timeline */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Order Timeline
            </Typography>
            <Box sx={{ maxHeight: '50vh', overflow: 'auto' }}>
              <OrderTimeline notifications={order.notifications} />
            </Box>

            {/* Comment Section */}
            {canAddComment && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Add Comment
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type your comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!comment.trim()}
                      onClick={handleAddComment}
                    >
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsDialog;
