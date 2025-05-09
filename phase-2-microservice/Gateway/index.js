const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 5000;

// Utility function to proxy requests
const proxyRequest = (baseUrl) => async (req, res) => {
  try {
    const url = `${baseUrl}${req.originalUrl}`;
    console.log(`Proxying request to: ${url}`);
    const method = req.method.toLowerCase();
    console.log(`Request method: ${method}`);
    console.log(`Request body:`, req.body);
      // Forward necessary headers including authorization
    const headers = { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': req.headers.authorization
    };
    
    const response = await axios({
      method,
      url,
      data: req.body,
      headers: headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    console.log(`Response status: ${response.status}`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    if (error.response) {
      console.error('Service response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    const status = error.response?.status || 500;
    const message = error.response?.data || { message: 'Internal Gateway Error' };
    res.status(status).json(message);
  }
};

// Health check function
async function checkServiceHealth(name, url) {
  try {
    await axios.get(url);
    console.log(`✓ ${name} service is reachable at ${url}`);
    return true;
  } catch (error) {
    console.error(`✗ ${name} service is not reachable at ${url}:`, error.message);
    return false;
  }
}

// Routes mapping
app.use('/api/users', proxyRequest(process.env.USER_SERVICE_URL));
app.use('/api/books', proxyRequest(process.env.BOOK_SERVICE_URL));
app.use('/api/loans', proxyRequest(process.env.LOAN_SERVICE_URL));

// Enhanced health check
app.get('/', async (req, res) => {
  const services = [
    { name: 'User', url: process.env.USER_SERVICE_URL },
    { name: 'Book', url: process.env.BOOK_SERVICE_URL },
    { name: 'Loan', url: process.env.LOAN_SERVICE_URL }
  ];

  const healthStatus = {
    gateway: 'up',
    services: {}
  };

  for (const service of services) {
    healthStatus.services[service.name] = await checkServiceHealth(service.name, service.url) ? 'up' : 'down';
  }

  res.json(healthStatus);
});

// 404 and error handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in API Gateway' });
});

// Start the server
app.listen(PORT, async () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Environment variables:');
  console.log('USER_SERVICE_URL:', process.env.USER_SERVICE_URL);
  console.log('BOOK_SERVICE_URL:', process.env.BOOK_SERVICE_URL);
  console.log('LOAN_SERVICE_URL:', process.env.LOAN_SERVICE_URL);
  
  // Check services health on startup
  const services = [
    { name: 'User', url: process.env.USER_SERVICE_URL },
    { name: 'Book', url: process.env.BOOK_SERVICE_URL },
    { name: 'Loan', url: process.env.LOAN_SERVICE_URL }
  ];

  console.log('\nChecking services health...');
  for (const service of services) {
    await checkServiceHealth(service.name, service.url);
  }
});
