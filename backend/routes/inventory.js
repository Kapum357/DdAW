const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { auth, checkRole } = require('../middleware/auth');

// GET all inventory items (requiere autenticación)
router.get('/', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find().populate('product');
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one inventory item
router.get('/:id', async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id).populate('product');
    if (inventoryItem) {
      res.json(inventoryItem);
    } else {
      res.status(404).json({ message: 'Inventory item not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE inventory levels (solo operadores POS y admin)
router.put('/:id', auth, checkRole('pos_operator', 'admin'), async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    Object.assign(inventoryItem, req.body);
    const updatedInventory = await inventoryItem.save();
    res.json(updatedInventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add stock to inventory (solo operadores POS y admin)
router.post('/add-stock/:id', auth, checkRole('pos_operator', 'admin'), async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    inventoryItem.quantity += req.body.quantity;
    const updatedInventory = await inventoryItem.save();
    res.json(updatedInventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove stock from inventory (solo operadores POS y admin)
router.post('/remove-stock/:id', auth, checkRole('pos_operator', 'admin'), async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    if (inventoryItem.quantity < req.body.quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    inventoryItem.quantity -= req.body.quantity;
    const updatedInventory = await inventoryItem.save();
    res.json(updatedInventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
