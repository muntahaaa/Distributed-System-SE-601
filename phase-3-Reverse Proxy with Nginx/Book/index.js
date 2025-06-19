require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5002;  // Book service on 5002

async function startServer() {
  try {
    // Database connection is already handled in app.js
    app.listen(PORT, () => {
      console.log(`Book service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}

startServer();