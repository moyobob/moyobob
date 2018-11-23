FROM python:3-stretch

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

COPY manage.py .
COPY backend backend
COPY api api
COPY websocket websocket
COPY cauth cauth

RUN mkdir db
RUN python manage.py migrate

EXPOSE 8000
VOLUME /app/db

CMD python manage.py runserver 0.0.0.0:8000
