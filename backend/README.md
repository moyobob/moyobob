# Moyobob Backend

## Using Docker Compose

```bash
$ sudo mkdir -p /srv/moyobob/backend/db
$ sudo nano /srv/moyobob/backend/env

REDIS_HOST=redis
REDIS_PORT=6379
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost

$ docker-compose up -d
```
