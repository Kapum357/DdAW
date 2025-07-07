import { Box, CircularProgress, Alert, Paper } from '@mui/material';

export const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
    <CircularProgress />
  </Box>
);

export const ErrorMessage = ({ message }) => (
  <Alert severity="error" sx={{ mb: 2 }}>
    {message}
  </Alert>
);

export const Card = ({ children }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      mb: 2,
      borderRadius: 2,
      backgroundColor: 'background.paper',
    }}
  >
    {children}
  </Paper>
);

export const PageContainer = ({ children }) => (
  <Box
    sx={{
      maxWidth: 1200,
      mx: 'auto',
      px: { xs: 2, sm: 3 },
      py: { xs: 2, sm: 3 },
    }}
  >
    {children}
  </Box>
);
