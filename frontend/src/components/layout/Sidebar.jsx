import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Toolbar,
} from '@mui/material';
import {
  ShoppingCart as OrdersIcon,
  Inventory as InventoryIcon,
  RestaurantMenu as ProductsIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Pedidos', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Productos', icon: <ProductsIcon />, path: '/products' },
  { text: 'Perfil', icon: <ProfileIcon />, path: '/profile' },
];

const Sidebar = ({ open, onClose, variant }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const drawer = (
    <>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (variant === 'temporary') onClose();
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant={variant}
      open={variant === 'permanent' ? true : open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
