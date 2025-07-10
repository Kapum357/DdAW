import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Typography,
  Paper,
  Box
} from '@mui/material';
import {
  PendingOutlined,
  LocalShipping,
  CheckCircleOutline,
  Cancel
} from '@mui/icons-material';
import { format } from 'date-fns';

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <PendingOutlined />;
    case 'processing':
      return <LocalShipping />;
    case 'completed':
      return <CheckCircleOutline />;
    case 'cancelled':
      return <Cancel />;
    default:
      return <PendingOutlined />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'grey';
  }
};

const OrderTimeline = ({ notifications = [] }) => {
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <Timeline position="right">
      {sortedNotifications.map((notification, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent color="textSecondary">
            {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
          </TimelineOppositeContent>
          
          <TimelineSeparator>
            <TimelineDot color={
              notification.type === 'STATUS_CHANGE' 
                ? getStatusColor(notification.message.split(' ').pop())
                : 'grey'
            }>
              {notification.type === 'STATUS_CHANGE' && 
                getStatusIcon(notification.message.split(' ').pop())}
            </TimelineDot>
            {index < notifications.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          
          <TimelineContent>
            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'background.default' }}>
              <Typography variant="body2" component="div">
                {notification.message}
              </Typography>
              {notification.type === 'COMMENT' && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    Comment by {notification.user?.username || 'System'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default OrderTimeline;
