FROM nikolaik/python-nodejs:python3.10-nodejs19-slim

WORKDIR /app

# Install python dependencies.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# install frontend dependencies
COPY ./frontend/package*.json ./frontend/
RUN npm --prefix frontend install

COPY . ./

# Build static assets
RUN npm run --prefix frontend build

# export assets
RUN python manage.py collectstatic

EXPOSE 8080

CMD gunicorn skytrack.wsgi -b 0:8080 --access-logfile - --timeout 0
