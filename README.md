# Vehicle Rental Management System (Docker)

A simple full-stack vehicle rental application with:
- Frontend: HTML, CSS, JavaScript served by Nginx
- Backend: Node.js + Express REST API
- Database: MySQL 8

## Requirements
Install Docker Desktop and ensure Docker Engine is running.

## Run the application
Open PowerShell or a terminal in this project folder:

```bash
docker compose up --build -d
docker compose ps
```

Open:
- Frontend: http://localhost:8080
- Backend health: http://localhost:5000/api/health

## Stop the application
```bash
docker compose down
```

To stop and also delete the database volume (this permanently deletes saved data):
```bash
docker compose down -v
```

## Build images separately
```bash
docker build -t YOUR_DOCKERHUB_USERNAME/vehicle-rental-frontend:1.0 ./frontend
docker build -t YOUR_DOCKERHUB_USERNAME/vehicle-rental-backend:1.0 ./backend
```

## Login and push to Docker Hub
Replace YOUR_DOCKERHUB_USERNAME with your Docker Hub username:

```bash
docker login
docker push YOUR_DOCKERHUB_USERNAME/vehicle-rental-frontend:1.0
docker push YOUR_DOCKERHUB_USERNAME/vehicle-rental-backend:1.0
```

The MySQL image is an official public image (`mysql:8.0`), so you normally do not need to build or push your own database image.

## Useful commands
```bash
docker compose logs -f
docker compose logs -f backend
docker compose down
docker images
```

## Notes
This is a classroom/demo starter, not a production-ready rental platform. It has no real payment processing or production authentication. Change the sample database passwords before any real deployment.
