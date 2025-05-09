const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user.routes');
const { sequelize } = require('./models');
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
sequelize.authenticate()
  .then(async () => {
    console.log('Database connection established');
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Smart Library System - User Service API' });
  });

app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: 'Something broke!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  module.exports = app;