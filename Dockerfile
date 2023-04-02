FROM nikolaik/python-nodejs:python3.10-nodejs19-slim

# Allow statements and log messages to immediately appear in the Knative logs
ENV PYTHONUNBUFFERED True

WORKDIR /app

# Install python dependencies.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./

# Node install and build
RUN npm --prefix frontend install


# Build static assets
# RUN npm run --prefix frontend build

# export assets
RUN python manage.py collectstatic

EXPOSE 8080

CMD gunicorn skytrack.wsgi -b 0:8080 --access-logfile - --timeout 0
