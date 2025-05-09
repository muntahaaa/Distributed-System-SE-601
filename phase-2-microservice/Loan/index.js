require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5003;  // Loan service on 5003

async function startServer() {
  try {
    // Database connection is already handled in app.js
    app.listen(PORT, () => {
      console.log(`Loan Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
}

startServer();