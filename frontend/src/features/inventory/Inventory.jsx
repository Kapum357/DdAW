import { useState } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Inventory = () => {
  const [inventory] = useState([]);
  const [loading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Form submission logic will be implemented here
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
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Item
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Last Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((item) => (
              <TableRow
                key={item._id}
                hover
                onClick={() => handleItemClick(item)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{item.product.name}</TableCell>
                <TableCell>{item.product.sku}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </TableCell>
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
            {selectedItem ? 'Update Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Product SKU"
                required
                fullWidth
                defaultValue={selectedItem?.product.sku || ''}
              />
              <TextField
                label="Quantity"
                required
                type="number"
                fullWidth
                defaultValue={selectedItem?.quantity || ''}
              />
              <TextField
                label="Location"
                required
                fullWidth
                defaultValue={selectedItem?.location || ''}
              />
              <TextField
                label="Notes"
                multiline
                rows={4}
                fullWidth
                defaultValue={selectedItem?.notes || ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedItem ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Inventory;
