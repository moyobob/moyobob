# Moyobob Backend

## Using Docker Compose

```bash
$ sudo nano /srv/moyobob/backend/env

REDIS_HOST=redis
REDIS_PORT=6379

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=somesecretpassword

DEBUG=True
ALLOWED_HOSTS=localhost

$ docker-compose up -d
$ docker-compose exec backend python manage.py migrate
```
