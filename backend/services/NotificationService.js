const { EventEmitter } = require('events');

class NotificationService extends EventEmitter {
    constructor() {
        super();
        this.clients = new Map();
    }

    // Register a client connection
    registerClient(userId, socket) {
        this.clients.set(userId, socket);
    }

    // Remove a client connection
    removeClient(userId) {
        this.clients.delete(userId);
    }

    // Send notification to a specific user
    sendToUser(userId, notification) {
        const socket = this.clients.get(userId);
        if (socket) {
            socket.emit('notification', notification);
        }
    }

    // Send notification to all clients with specified role
    sendToRole(role, notification) {
        this.clients.forEach((socket, userId) => {
            if (socket.user && socket.user.role === role) {
                socket.emit('notification', notification);
            }
        });
    }

    // Send notification about order status change
    notifyOrderStatus(order) {
        const notification = {
            type: 'ORDER_STATUS_CHANGE',
            orderId: order._id,
            status: order.status,
            timestamp: new Date(),
            message: `Order #${order._id} status changed to ${order.status}`
        };

        // Notify the customer
        this.sendToUser(order.user.toString(), notification);

        // Notify POS operators if order is new
        if (order.status === 'pending') {
            this.sendToRole('pos_operator', {
                ...notification,
                message: `New order received: #${order._id}`
            });
        }
    }
}

module.exports = new NotificationService();
