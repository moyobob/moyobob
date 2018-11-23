FROM python:3-alpine

WORKDIR /app

RUN apk --no-cache add --virtual .build-deps gcc musl-dev
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir
RUN apk --no-cache del --purge .build-deps

COPY manage.py .
COPY backend backend
COPY api api
COPY websocket websocket
COPY cauth cauth

RUN mkdir db
RUN python manage.py migrate

EXPOSE 8000
VOLUME /app/db

CMD gunicorn --bind 0.0.0.0:8000 backend.wsgi:application
