# FinalCloud

## Source Code

- **Backend**: Node.js, Express, MongoDB
- **Frontend**: Vite, React, TypeScript, TailwindCSS

---

## How to Start the Project

### Step 0: Setting Up MongoDB

Refer to the [Backend and DB setting tutorials](https://github.com/ChenTim1011/HappyNotes/tree/main/src/backend) for detailed instructions on configuring MongoDB.

### Step 1: Navigate to the `src` Directory

Ensure you are in the `FinalCloud/src` directory:

```bash
cd FinalCloud/src
```

### Step 2: Install Dependencies

Install the dependencies for both backend and frontend:

```bash
# Install src dependencies, backend, and frontend dependencies.
npm install && npm install --prefix backend && npm install --prefix frontend/react-frontend
```

### Step 3: Configure Environment Variables

#### 3.1. Create `.env` and `.env.production` Files

Navigate to the `backend` directory and create two environment files: `.env` for development and `.env.production` for production.  
You can also change .env_template or .env.production.template to .env and .env.production

```bash
cd backend
touch .env .env.production
```

#### 3.2. Populate the `.env` File (Development Environment)

Open the `.env` file and add the following environment variables. Replace the placeholder values with your actual development configuration.

```dotenv
# .env (Development Environment)

NODE_ENV=development
DB_USER=local_user
DB_PASS=local_password
DB_HOST=localhost
DB_PORT=27017
DB_NAME=local_db
# DB_SSL_CA is not required for local development

```

For example
```dotenv
export NODE_ENV=development
export DB_HOST=127.0.0.1
export DB_PORT=27017
export DB_NAME=whiteboards
```


#### 3.3. Populate the `.env.production` File (Production Environment)

Open the `.env.production` file and add the following environment variables. Replace the placeholder values with your actual production configuration, especially the path to your SSL CA certificate for AWS DocumentDB.

```dotenv
# .env.production (Production Environment)

NODE_ENV=production
DB_USER=aws_user
DB_PASS=aws_password
DB_HOST=aws-hostname
DB_PORT=27017
DB_NAME=aws_db
DB_SSL_CA=/path/to/rds-combined-ca-bundle.pem
```

**Note**: Ensure that `.env` and `.env.production` files are **not** committed to version control systems like Git. Add them to your `.gitignore` file if not already present.

```gitignore
# .gitignore

.env
.env.production
```

### Step 4: Start Both Services

Return to the `FinalCloud/src` directory and start both backend and frontend in the development environment:

```bash
cd ../../
npm run start:dev

# - **Backend**: Uses PM2 to manage the backend app and the database.
# - **Frontend**: Starts the Vite development server.
```

#### Starting in Production Environment

To start the services in the production environment, ensure that your `.env.production` is correctly configured and run:

```bash
npm run start:prod

# - **Backend**: Uses PM2 to manage the backend app and the database in production mode.
# - **Frontend**: Starts the Vite server as configured for production.
```

### Step 5: Stopping the Application

You have multiple options for stopping the services:

#### Option 1: Using NPM Scripts

1. **Stop All Services**:

   ```bash
   npm run stop
   ```

   This command stops both backend and frontend services.

2. **Stop Backend Services**:

   ```bash
   npm run stop-backend
   ```

   This command stops only the backend services managed by PM2.

3. **Stop Frontend Service**:

   ```bash
   npm run stop-frontend
   ```

   This command stops the frontend service running on port 5173.

