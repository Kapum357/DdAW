import { Badge, IconButton, Menu, MenuItem, List, ListItem, ListItemText, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState } from 'react';
import { useNotifications } from '../../context/notification';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, markAsRead, clearNotifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    handleClose();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '300px',
          },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="textSecondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          <>
            <MenuItem onClick={clearNotifications}>
              <Typography color="primary">Clear all</Typography>
            </MenuItem>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {notifications.map((notification, index) => (
                <ListItem
                  key={index}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    backgroundColor: notification.read ? 'inherit' : 'action.hover',
                    '&:hover': {
                      backgroundColor: 'action.selected',
                      cursor: 'pointer',
                    },
                  }}
                >
                  <ListItemText
                    primary={notification.message}
                    secondary={formatTimestamp(notification.timestamp)}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
