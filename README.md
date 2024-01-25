### How to Run
Using [Docker Compose](https://docs.docker.com/compose/):
```abash
docker compose up
```

Locally (requires node.js and Python-3.10+):

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# install dependencies
pip install -r requirements.txt
npm --prefix frontend install

# Build assets
npm run --prefix frontend build
python manage.py collectstatic

# Run
gunicorn skytrack.wsgi -b 0:8080 --access-logfile - --timeout 0
```
