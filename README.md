# OTP Bud

This is the main repository for the OTP Bud application, which consists of a backend server and a frontend client. The backend is built with NestJS and Prisma, while the frontend is built with React and Vite.

## Directory Structure

- `backend/`: Contains the NestJS backend server code.
- `frontend/`: Contains the React frontend client code.

## References

- Backend Setup: [backend/README.md](./backend/README.md)
- Frontend Setup: [frontend/README.md](./frontend/README.md)

# Building and Running with Docker

## Development Environment

To run the application in development with Docker, follow these steps:

1. **Configure Environment Variables**: Create a `.env` file in the root of the project based on the provided `.env.example` file. Make sure to set the correct values for your database and JWT secret.
2. **Start Services with Docker Compose**: Use the following command to start the database and Redis services:
   ```bash
   docker-compose -f dev.docker-compose.yml up -d
   ```
   This will start PostgreSQL and Redis services. You'll need to run the backend and frontend locally.
3. **Stop the Services**: To stop the running services, use:
   ```bash
   docker-compose -f dev.docker-compose.yml down
   ```

## Production Environment

To build and run the application for production:

1. **Configure Environment Variables**: Create a `.env` file with production values.
2. **Build and Run with Docker Compose**: Use the following command to build and start the application:
   ```bash
   docker-compose -f prod.docker-compose.yml up --build
   ```
   This will build and start both the backend and frontend services, along with a PostgreSQL database.
3. **Access the Application**: Once the services are up and running, access the frontend at `http://localhost:3000` and the backend API at `http://localhost:4000`.
4. **Stop the Services**: To stop the running services, use:
   ```bash
   docker-compose -f prod.docker-compose.yml down
   ```

## Notes

- Ensure that you have Docker and Docker Compose installed on your machine.
- The `.env` file should not be committed to version control as it contains sensitive information.
- You can find a `.env.example` file in the root of the project to use as a template for your environment variables.
