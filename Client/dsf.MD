[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/8G6eE_6R)

# Project Setup Guide

**Students:**
| Name | ID |
| :--- | :--- |
| Tomer Natan | 213638976 |
| Harel Mashiah | 206375081 |
| Ori Marko | 318846615 |

## Setup Instructions

### 1. Create a Docker Network

First, create a local network so the containers can communicate securely with each other:

```bash
docker network create my-project-net
```

### 2. Set up the Database (PostgreSQL)

Run the database container, connect it to the network, and set a password:

```bash
docker run -d \
  --name my-postgres-db \
  --network my-project-net \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=my-secret-pw \
  postgres:latest
```

### 3. Set up the Web Application (Drupal)

Run the Drupal system and expose it to port 8080 on the host machine:

```bash
docker run -d \
  --name my-drupal-app \
  --network my-project-net \
  -p 8080:80 \
  drupal
```

### 4. Configure the Website in the Browser

Open your browser and navigate to: [http://localhost:8080](http://localhost:8080)

In the Drupal installation wizard, enter the following connection details:

- **Database type:** PostgreSQL
- **Database name:** postgres
- **Database username:** postgres
- **Database password:** `my-secret-pw`
- **Host:** `my-postgres-db` (under Advanced Options)
- **Port:** 5432

**Note:** At the end of the installation, create an admin user named `demoadmin` with the password `secretpass`.

---

## Restore from Backup

If the system was deleted and needs to be rebuilt (on a "clean" environment), follow steps 1-3 to start the containers, then proceed with the restoration:

**A. Clear the database schema:**

```bash
docker exec -i my-postgres-db psql -U postgres -d postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

**B. Load the backup file into the container:**

```bash
cat drupal_db_backup.sql | docker exec -i my-postgres-db psql -U postgres -d postgres
```

**C. Restart the service to apply changes:**

```bash
docker restart my-drupal-app
```

---

## Cleanup

At the end of the work or for a full reset, stop and delete the containers, images, and network:

```bash
docker stop my-drupal-app my-postgres-db
docker rm my-drupal-app my-postgres-db
docker rmi drupal postgres
docker network rm my-project-net
```
