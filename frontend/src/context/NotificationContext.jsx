import { useState } from 'react';
import { useAuth } from './auth';
import { Snackbar, Alert } from '@mui/material';
import { NotificationContext } from './notification';

export const NotificationProvider = ({ children }) => {
  useAuth();
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'info' });



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
