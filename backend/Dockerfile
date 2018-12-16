FROM python:3-alpine

WORKDIR /app

RUN apk update && \
    apk --no-cache add postgresql-libs && \
    apk --no-cache add --virtual .build-deps gcc musl-dev make postgresql-dev
COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir
RUN apk --no-cache del --purge .build-deps

COPY manage.py .
COPY cauth cauth
COPY api api
COPY websocket websocket
COPY backend backend

EXPOSE 8000

CMD uvicorn --host 0.0.0.0 --port 8000 backend.asgi:application
