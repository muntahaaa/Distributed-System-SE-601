require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;  // Gateway runs on 5000

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:5002';
const LOAN_SERVICE_URL = process.env.LOAN_SERVICE_URL || 'http://localhost:5003';

// Function to start a microservice
function startService(serviceName, serviceDir) {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const serviceProcess = spawn(npmCmd, ['start'], {
        cwd: path.join(__dirname, '..', serviceName),
        stdio: 'pipe',
        shell: true
    });

    serviceProcess.stdout.on('data', (data) => {
        console.log(`[${serviceName}] ${data}`);
    });

    serviceProcess.stderr.on('data', (data) => {
        console.error(`[${serviceName} Error] ${data}`);
    });

    serviceProcess.on('close', (code) => {
        console.log(`[${serviceName}] exited with code ${code}`);
    });

    return serviceProcess;
}

// Start all microservices
console.log('Starting microservices...');
const services = [
    { name: 'User', dir: 'User' },
    { name: 'Book', dir: 'Book' },
    { name: 'Loan', dir: 'Loan' }
];

const serviceProcesses = services.map(service => startService(service.dir, service.dir));

// Setup proxy routes
app.use('/api/users', proxy(USER_SERVICE_URL));
app.use('/api/books', proxy(BOOK_SERVICE_URL));
app.use('/api/loans', proxy(LOAN_SERVICE_URL));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Gateway is running',
        services: {
            gateway: `http://localhost:${PORT}`,
            user: USER_SERVICE_URL,
            book: BOOK_SERVICE_URL,
            loan: LOAN_SERVICE_URL
        }
    });
});

// Start the gateway
app.listen(PORT, () => {
    console.log(`Gateway Service is running on port ${PORT}`);
    console.log('Proxying to:');
    console.log(`- User Service: ${USER_SERVICE_URL}`);
    console.log(`- Book Service: ${BOOK_SERVICE_URL}`);
    console.log(`- Loan Service: ${LOAN_SERVICE_URL}`);
});

// Handle shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down services...');
    serviceProcesses.forEach(proc => proc.kill());
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down services...');
    serviceProcesses.forEach(proc => proc.kill());
    process.exit(0);
});