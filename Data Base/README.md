turn off the container 
docker-compose down

turn it on
docker-compose up -d

read backup 
docker exec -i dietitian_db psql -U admin -d hospital_system < hospital_backup.sql


make backup
docker exec -t dietitian_db pg_dump -U admin -d hospital_system > hospital_backup.sql