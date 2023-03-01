FROM python:3.10-slim

RUN apt update && apt install -y nodejs npm

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

WORKDIR /app
COPY . ./

# Node install and build
RUN npm install

# Install production dependencies.
RUN pip install --no-cache-dir -r requirements.txt

# Build static assets
RUN npm run build

# export assets
RUN python manage.py collectstatic

EXPOSE 8080

CMD python manage.py migrate && gunicorn ephem.wsgi -b 0:8080 --workers=10 --access-logfile - --timeout 0
