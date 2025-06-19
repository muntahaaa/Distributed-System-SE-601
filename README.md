# Distributed-System-SE-601
# Awesome System Evolution

This repository demonstrates the evolution of a software system from a **Monolithic Architecture** to a **Microservices Architecture**, managed using Git branches.

---

## 📌 Project Phases

### 🟩 Phase 1 – Monolithic Architecture
- **Branch:** [`phase-1`](https://github.com/muntahaaa/Software-design-SE-606.git/phase-1-monolithic)
- Contains a single application in one codebase.
- Suitable for small-scale applications or initial MVP.

### 🟦 Phase 2 – Microservices Architecture
- **Branch:** [`phase-2`](https://github.com/muntahaaa/Software-design-SE-606.git)
- Contains multiple services (e.g., auth-service, user-service) communicating over APIs.
- Better for scalability, team autonomy, and distributed systems.

### 🟨 Phase 3 – Containerized Microservices with Nginx
- **Branch:** [`phase-3`](https://github.com/muntahaaa/Software-design-SE-606.git/phase-3)
- Containerized microservices using Docker
- Nginx as reverse proxy for load balancing and routing
- Docker Compose for orchestration
- Enhanced scalability and deployment management

---

## 🛠 How to Use

1. Clone the repo:
   ```bash
   git clone https://github.com/muntahaaa/Software-design-SE-606.git
   cd Software-design-SE-606
   ```

2. Choose a phase:
   ```bash
   git checkout phase-1  # For monolithic
   git checkout phase-2  # For microservices
   git checkout phase-3  # For containerized version
   ```

3. Setup and Run:

   ### Phase 1 (Monolithic):
   ```bash
   cd phase-1-monolithic
   npm install
   npm start
   ```

   ### Phase 2 (Microservices):
   ```bash
   # Start each service in separate terminals
   cd phase-2-microservice/Gateway && npm install && npm start
   cd phase-2-microservice/User && npm install && npm start
   cd phase-2-microservice/Book && npm install && npm start
   cd phase-2-microservice/Loan && npm install && npm start
   ```

   ### Phase 3 (Containerized):
   ```bash
   cd phase-3-Reverse\ Proxy\ with\ Nginx
   docker-compose up --build
   ```

## 🔌 Service Ports

### Phase 2 & 3:
- Gateway: `5000`
- User Service: `5001`
- Book Service: `5002`
- Loan Service: `5003`
- Nginx (Phase 3): `80`

## 📚 Architecture Overview

### Phase 1 - Monolithic
- Single codebase
- Shared database
- Simple deployment

### Phase 2 - Microservices
- Separate services for Users, Books, and Loans
- API Gateway for routing
- Independent databases
- Service-to-service communication

### Phase 3 - Containerized with Nginx
- Dockerized microservices
- Nginx reverse proxy for:
  - Load balancing
  - SSL termination
  - Request routing
- Docker Compose for:
  - Service orchestration
  - Environment management
  - Easy scaling

## 🔒 Environment Variables

Each service requires its own `.env` file. Example structure:

```env
# Gateway
PORT=5000
USER_SERVICE_URL=http://localhost:5001
BOOK_SERVICE_URL=http://localhost:5002
LOAN_SERVICE_URL=http://localhost:5003

# Services (User/Book/Loan)
PORT=50XX
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
```

## 📝 API Documentation

Access the API documentation for each phase:
- Phase 1: `http://localhost:3000/api-docs`
- Phase 2: `http://localhost:5000/api-docs`
- Phase 3: `http://localhost/api-docs`
