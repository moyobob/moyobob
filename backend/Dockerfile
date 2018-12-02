FROM python:3-alpine

WORKDIR /app

RUN apk --no-cache add --virtual .build-deps gcc musl-dev make
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir
RUN apk --no-cache del --purge .build-deps

COPY manage.py .
COPY backend backend
COPY api api
COPY websocket websocket
COPY cauth cauth
RUN mkdir db

EXPOSE 8000

CMD daphne -b 0.0.0.0 -p 8000 backend.asgi:application
