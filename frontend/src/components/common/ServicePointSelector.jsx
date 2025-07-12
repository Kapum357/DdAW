import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';

const ServicePointSelector = ({ onSelect, selectedPoint }) => {
  const [servicePoints, setServicePoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const apiUrl = 'https://backend-kapum357s-projects.vercel.app';

  const fetchServicePoints = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/service-points`);
      setServicePoints(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching service points');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchServicePoints();
  }, [fetchServicePoints]);

  const getUserLocation = () => {
    setLoadingLocation(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
          // Get nearest service point
          const response = await axios.get(
            `${apiUrl}/api/service-points/nearest?lat=${latitude}&lng=${longitude}`
          );
          
          if (response.data) {
            onSelect(response.data);
          }
        } catch (err) {
          setError('Error finding nearest service point');
          console.error('Error:', err);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        setError('Error getting your location: ' + error.message);
        setLoadingLocation(false);
      }
    );
  };

  const calculateDistance = (point) => {
    if (!userLocation) return null;

    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point.latitude - userLocation.latitude);
    const dLon = toRad(point.longitude - userLocation.longitude);
    const lat1 = toRad(userLocation.latitude);
    const lat2 = toRad(point.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * 
              Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance.toFixed(1);
  };

  const toRad = (value) => value * Math.PI / 180;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
        <CircularProgress />
      </Box>
    );
  }

  const SelectedPointCard = () => selectedPoint && (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Selected Service Point
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <LocationIcon color="primary" />
          <Typography>
            {selectedPoint.name}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {selectedPoint.address}
        </Typography>
        {userLocation && (
          <Typography variant="body2" color="text.secondary">
            {calculateDistance(selectedPoint)} km away
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <SelectedPointCard />
        <Button
          startIcon={<MyLocationIcon />}
          onClick={getUserLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? 'Getting location...' : 'Find Nearest'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<LocationIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Change Location
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Service Point</DialogTitle>
        <DialogContent>
          <List>
            {servicePoints.map((point) => (
              <ListItem
                key={point._id}
                button
                selected={selectedPoint?._id === point._id}
                onClick={() => {
                  onSelect(point);
                  setOpenDialog(false);
                }}
              >
                <ListItemText
                  primary={point.name}
                  secondary={point.address}
                />
                <ListItemSecondaryAction>
                  {userLocation && (
                    <Typography variant="body2" color="text.secondary">
                      {calculateDistance(point)} km
                    </Typography>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicePointSelector;
