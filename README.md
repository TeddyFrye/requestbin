# Request Bin Clone

## Installation

### Install PostgreSQL

- **macOS:**

  ```sh
  brew install postgresql@16
  brew services start postgresql@16
  ```

- **Ubuntu:**

  ```sh
  sudo apt update
  sudo apt install -y postgresql postgresql-contrib
  sudo service postgresql start
  ```

### Create database and "appuser"

- **macOS:**

  ```sh
  createdb requestbin 2>/dev/null || true
  psql -d postgres -v ON_ERROR_STOP=1 -c "DO $$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='appuser') THEN
      CREATE ROLE appuser LOGIN PASSWORD 'dev_password';
    END IF;
  END $$;"
  psql -d postgres -c "ALTER DATABASE requestbin OWNER TO appuser;"
  ```

- **Ubuntu:**

  ```sh
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DO $$
  BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='appuser') THEN
    CREATE ROLE appuser LOGIN PASSWORD 'dev_password';
  END IF;
  END $$;"
  sudo -u postgres psql -c "SELECT 1"  # sanity
  sudo -u postgres createdb -O appuser requestbin 2>/dev/null || true
  ```

- Note from Nathan: the first part of the above didn't work for me (syntax error) so I just entered the `psql` terminal and pasted the SQL directly in there:

  ```sh
  sudo -u postgres psql # runs `psql` as the postgres user
  ```

  ```sql
  CREATE ROLE appuser LOGIN PASSWORD 'dev_password';
  ```

  ```sh
  sudo -u postgres createdb -O appuser requestbin
  ```

### Install MongoDB

(It may ask for a password, you can just cancel out of that and it should still install)

- **macOS:**

  ```sh
  brew tap mongodb/brew
  brew install mongodb-community
  brew services start mongodb-community
  ```

- **Ubuntu:**

  ```sh
  sudo apt-get install -y gnupg curl
  curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
  echo "deb [ signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
  sudo apt-get update
  sudo apt-get install -y mongodb-org
  sudo systemctl enable --now mongod
  ```

### Configure Environment

copy this into your `.env` file:

For development:

```text
ENV=dev

DATABASE_URL=postgres://appuser:dev_password@localhost:5432/requestbin

MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=requestbin
MONGO_COLLECTION=request_bodies
```

For production:

```text
ENV=production

PG_CREDENTIALS_KEY=<secret key for rds credentials>
PG_DATABASE=requestbin

MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=requestbin
MONGO_COLLECTION=request_bodies
```

### Install Dependencies

```sh
npm install
```

### Seed the Databases

Make sure both PostgreSQL and MongoDB are running.

```sh
npm run migrate
npm run seed
```

This will populate both databases with initial data.

### Test the Postgres database has data

```sh
psql "$DATABASE_URL" -c "SELECT count(*) AS baskets FROM baskets;
SELECT count(*) AS requests FROM requests;"

mongosh --eval "db.getSiblingDB('requestbin').request_bodies.countDocuments()"
```

These should return a baskets table, a requests table, and a count of the documents within MongoDB

### Troubleshooting

- Ensure database connection details in `.env` are correct.
- Check that both database services are running before seeding.

## Building Frontend Static Files

- **Frontend Only:**

  If you just want to build the frontend static files _without_ copying them to the backend:

  ```sh
  cd frontend
  npm run build
  ```

  This will build the files into `frontend/dist`.

- **To Serve From Backend:**

  If you want to serve the static files from the express backend, you can skip the instructions above and just do the following:

  ```sh
  cd backend
  npm run build
  ```

  This will run the frontend build script and then copy the files into `backend/public`.
