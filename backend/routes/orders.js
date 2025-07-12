const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, checkRole } = require('../middleware/auth');

// GET all orders (operadores POS pueden ver todos, clientes solo ven los suyos)
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'client') {
      orders = await Order.find({ user: req.user._id })
        .populate('user', 'username')
        .populate('items.product');
    } else {
      orders = await Order.find()
        .populate('user', 'username')
        .populate('items.product');
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one order with notifications
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username')
      .populate('items.product');
      
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (req.user.role === 'client' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE an order with notification
router.post('/', auth, async (req, res) => {
  const order = new Order({
    user: req.user._id,
    items: req.body.items,
    total: req.body.total,
    servicePoint: req.body.servicePoint,
    status: 'pending',
    notifications: [{
      type: 'SYSTEM',
      message: 'Order created successfully'
    }]
  });

  try {
    const newOrder = await order.save();
    
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE order status with notifications
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validar permisos
    if (req.user.role === 'client' && 
        req.body.status && 
        req.body.status !== 'cancelled') {
      return res.status(403).json({ 
        message: 'Clients can only cancel orders' 
      });
    }

    if (req.user.role === 'client' && 
        order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You can only modify your own orders' 
      });
    }

    const oldStatus = order.status;
    Object.assign(order, req.body);

    // Add notification for status change
    if (oldStatus !== order.status) {
      order.notifications.push({
        type: 'STATUS_CHANGE',
        message: `Order status changed from ${oldStatus} to ${order.status}`
      });
    }

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Mark notifications as read
router.post('/:id/notifications/read', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check permissions
    if (req.user.role === 'client' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this order' });
    }

    // Mark all notifications as read
    order.notifications = order.notifications.map(notification => ({
      ...notification.toObject(),
      read: true
    }));

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a comment to order
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add comment as notification
    order.notifications.push({
      type: 'COMMENT',
      message: req.body.comment,
      read: false
    });

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
