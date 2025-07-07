import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './auth';
import { Snackbar, Alert } from '@mui/material';
import { NotificationContext } from './notification';

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user && user.token) {
      // Connect to Socket.IO server
      const newSocket = io(import.meta.env.VITE_API_URL, {
        auth: {
          token: user.token
        }
      });

      // Handle connection
      newSocket.on('connect', () => {
        console.log('Connected to notification service');
      });

      // Handle notifications
      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        
        // Show alert for new notifications
        setAlert({
          open: true,
          message: notification.message,
          severity: notification.type === 'ERROR' ? 'error' : 'info'
        });
      });

      // Handle errors
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setAlert({
          open: true,
          message: 'Error connecting to notification service',
          severity: 'error'
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    }
  }, [user]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleAlertClose = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        clearNotifications
      }}
    >
      {children}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleAlertClose} 
          severity={alert.severity}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
