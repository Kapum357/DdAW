import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Rating,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/auth';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const apiUrl = 'https://backend-kapum357s-projects.vercel.app';

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products/${productId}/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [apiUrl, productId]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products/${productId}/reviews/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching review stats:', error);
    }
  }, [apiUrl, productId]);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [fetchReviews, fetchStats]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/api/reviews`, {
        productId,
        rating,
        comment
      });
      setOpenDialog(false);
      setRating(0);
      setComment('');
      fetchReviews();
      fetchStats();
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting review');
    }
  };

  const RatingBar = ({ value, count, total }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Typography variant="body2" sx={{ minWidth: 50 }}>
        {value} ★
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(count / total) * 100}
        sx={{ flexGrow: 1, mx: 1 }}
      />
      <Typography variant="body2" sx={{ minWidth: 50 }}>
        ({count})
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Customer Reviews
      </Typography>

      {stats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Box mr={2}>
                <Typography variant="h3">{stats.averageRating}</Typography>
                <Rating value={stats.averageRating} precision={0.1} readOnly />
                <Typography variant="body2">
                  {stats.totalReviews} reviews
                </Typography>
              </Box>
              <Box flex={1}>
                {[5, 4, 3, 2, 1].map(value => (
                  <RatingBar
                    key={value}
                    value={value}
                    count={stats.ratingDistribution[value]}
                    total={stats.totalReviews}
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {user && (
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 3 }}
        >
          Write a Review
        </Button>
      )}

      <Stack spacing={2}>
        {reviews.map((review) => (
          <Card key={review._id}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <Avatar sx={{ mr: 2 }}>
                  {review.user.username[0].toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {review.user.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
              <Rating value={review.rating} readOnly />
              <Typography variant="body1" mt={1}>
                {review.comment}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitReview}>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                <Typography component="legend">Your Rating</Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue)}
                  size="large"
                />
              </Box>
              <TextField
                label="Your Review"
                multiline
                rows={4}
                fullWidth
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!rating || !comment}
            >
              Submit Review
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductReviews;
