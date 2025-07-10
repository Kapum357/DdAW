import { Grid, Box, Typography } from '@mui/material';
import ProductCard from './ProductCard';
import { Fade } from '@mui/material';

const ProductsGrid = ({ products, onEdit }) => {
  if (products.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="subtitle1" color="text.secondary">
          No products found
        </Typography>
      </Box>
    );
  }

  return (
    <Fade in={true}>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <ProductCard
              product={product}
              onEdit={onEdit}
            />
          </Grid>
        ))}
      </Grid>
    </Fade>
  );
};

export default ProductsGrid;
