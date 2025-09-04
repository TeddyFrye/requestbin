### Install PostgreSQL

- **macOS:**
  ```sh
  brew install postgresql@16
  brew services start postgresql@16
  ```

```
# Create database and "appuser"
```

createdb requestbin 2>/dev/null || true
psql -d postgres -v ON_ERROR_STOP=1 -c "DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='appuser') THEN
    CREATE ROLE appuser LOGIN PASSWORD 'dev_password';
  END IF;
END $$;"
psql -d postgres -c "ALTER DATABASE requestbin OWNER TO appuser;"

````
- **Ubuntu:**
```sh
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start

# Create app role + DB
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DO $$
BEGIN
IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='appuser') THEN
  CREATE ROLE appuser LOGIN PASSWORD 'dev_password';
END IF;
END $$;"
sudo -u postgres psql -c "SELECT 1"  # sanity
sudo -u postgres createdb -O appuser requestbin 2>/dev/null || true
````

### Install MongoDB (It may ask for a password, you can just cancel out of that and it should still install)

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

```

### Configure Environment
```

copy this into your env file:
DATABASE_URL=postgres://appuser@localhost:5432/requestbin

PGUSER=appuser
PGDATABASE=requestbin

MONGO_URL=mongodb://localhost:27017
MONGO_DB_NAME=requestbin
MONGO_COLLECTION=request_bodies

````

### Install Dependencies

```sh
npm install
````

### Seed the Databases

Make sure both PostgreSQL and MongoDB are running.

```sh
node seed.js
```

This will populate both databases with initial data.

## Test the Postgres database has data

```
psql "$DATABASE_URL" -c "SELECT count(*) AS baskets FROM baskets;
SELECT count(*) AS requests FROM requests;"

mongosh --eval "db.getSiblingDB('requestbin').request_bodies.countDocuments()"
```

These should return a baskets table, a requests table, and a count of the documents within MongoDB

## Troubleshooting

- Ensure database connection details in `.env` are correct.
- Check that both database services are running before seeding.
