### Backend  nodejs + express + MongoDB

# nodejs + express
## initial
   1. npm install
## start connection and server
   1. npm run db
   2. npm run app
## stop connection and server
   1. npm run stop-app
   2. npm run stop-db

# MongoDB Installation
## Ubuntu :
1. sudo apt-get install gnupg curl
2. curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor
3. echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

4. sudo apt-get update

5. sudo apt-get install -y mongodb-org

## Windows: 

1. 載點: https://www.mongodb.com/try/download/community


# Redis setting

1. Change the file name .env_template => .env

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password (You need to setting)
```

Ensure you have installed redis => npm install redis

2. How to setting the redis password? 

Ubuntu/Debian:

```bash
   sudo apt-get update
   sudo apt-get install redis-server
   sudo service redis-server start
```

3. After installation, verify the running status of Redis:

```bash
redis-cli ping
```

It should respond with "PONG".

### Complete steps for setting a password:

Start the Redis server and connect to the Redis CLI.
Set the password:

```bash
CONFIG SET requirepass "your_password"
```

# Verify password setting
```bash
AUTH your_password
```

# Test the connection
ping

# To persist the settings and prevent the password from being invalidated after restarting Redis, 
it is recommended to edit the Redis configuration file /etc/redis/redis.conf, find the line # requirepass, and change it to:

```bash
requirepass your_password
```

Restart the Redis service:

```bash
sudo service redis-server restart
```