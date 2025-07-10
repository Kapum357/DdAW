import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../../context/auth';

const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'success';
    case 'out_of_stock':
      return 'error';
    case 'discontinued':
      return 'default';
    default:
      return 'default';
  }
};

const ProductCard = ({ product, onEdit }) => {
  const { user } = useAuth();
  const canEdit = ['pos_operator', 'admin'].includes(user?.role);

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          transition: 'all 0.3s ease'
        }
      }}
    >
      {canEdit && (
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
        >
          <EditIcon />
        </IconButton>
      )}
      
      <CardMedia
        component="img"
        height="140"
        image={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
        alt={product.name}
        sx={{ objectFit: 'cover' }}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {product.name}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 2
          }}
        >
          {product.description}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Typography variant="h6" color="primary" gutterBottom>
            ${product.price.toFixed(2)}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip
              label={product.category}
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip
              label={product.status.replace('_', ' ')}
              color={getStatusColor(product.status)}
              size="small"
            />
          </Box>

          {product.stock <= 10 && product.status !== 'discontinued' && (
            <Typography 
              variant="caption" 
              color="error"
              sx={{ display: 'block', mt: 1 }}
            >
              Low stock: {product.stock} remaining
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
