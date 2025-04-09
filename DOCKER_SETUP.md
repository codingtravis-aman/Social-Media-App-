# Docker Configuration for Yoop Social Media App

This document provides instructions for containerizing the Yoop social media application using Docker and Docker Compose. The setup includes containerized environments for the backend, frontend, and PostgreSQL database.

## Project Structure

```bash
/yoop
├── client/         # React/Vite frontend
├── server/         # Express/Node backend 
├── docker/         # Docker configuration
│   ├── server.Dockerfile
│   ├── client.Dockerfile
│   └── docker-compose.yml
└── .env            # Environment variables
```

## Dockerfiles

### Backend (server.Dockerfile)

```dockerfile
FROM node:20

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose the port the server runs on
EXPOSE 5000

# Command to run the server
CMD ["npm", "run", "dev"]
```

### Frontend (client.Dockerfile)

```dockerfile
FROM node:20

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose the Vite dev server port
EXPOSE 3000

# Command to run the client
CMD ["npm", "run", "dev"]
```

## Docker Compose Configuration

Below is the `docker-compose.yml` file that orchestrates the entire application:

```yaml
version: "3.8"
services:
  backend:
    build:
      context: ../
      dockerfile: docker/server.Dockerfile
    ports:
      - "5000:5000"
    volumes:
      - ../:/app
      - /app/node_modules
    environment:
      - PORT=5000
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/yoop
      - SESSION_SECRET=your_session_secret_here

  frontend:
    build:
      context: ../client
      dockerfile: ../docker/client.Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ../client:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:5000
    depends_on:
      - backend

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: yoop
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Backend
PORT=5000
DATABASE_URL=postgres://postgres:postgres@postgres:5432/yoop
SESSION_SECRET=your_session_secret_here

# Frontend
VITE_API_URL=http://localhost:5000
```

## Setup Instructions

1. **Create Docker Directory Structure**:
   ```bash
   mkdir -p docker
   ```

2. **Create Docker Files**:
   - Place the server.Dockerfile in the docker directory
   - Place the client.Dockerfile in the docker directory
   - Place the docker-compose.yml in the docker directory

3. **Build and Run with Docker Compose**:
   ```bash
   # Navigate to the docker directory
   cd docker
   
   # Build and start all services
   docker-compose up --build
   ```

4. **Accessing the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

5. **Stop the Services**:
   ```bash
   docker-compose down
   ```

## Development with Docker

- The configuration includes volume mounting to enable live code reloading during development.
- Backend and frontend changes should be detected and automatically restart the services.
- Database data is persisted in a named volume (`postgres-data`).

## Production Deployment

For production deployment, modify the Dockerfiles and docker-compose.yml:

1. Use multi-stage builds to create smaller production images
2. Change the CMD to use production commands (e.g., `npm run start` instead of `npm run dev`)
3. Add proper health checks and restart policies
4. Consider using a reverse proxy like Nginx for the frontend
5. Implement proper secrets management instead of environment variables

## Common Docker Commands

```bash
# View running containers
docker ps

# View logs for a specific service
docker-compose logs -f backend

# Restart a specific service
docker-compose restart frontend

# Access container shell
docker-compose exec backend sh
```