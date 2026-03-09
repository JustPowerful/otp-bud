# Setup

Follow the instructions below to set up the backend of the OTP Bud application.

### ENV Variables

You have to create a `.env` file in the `backend` directory with the following content, replacing the placeholder values with your actual configuration:

```bash
# For the database
DATABASE_URL="postgres://username:password@localhost:5432/database_name"

# For the JWT Auth
JWT_SECRET="your_secret_key_here"

# For the SMTP server
# Mailer ENV configurations
SMTP_HOST="smtp.example.com"
SMTP_USER='user@mail.com'
SMTP_PASS='your_smtp_password'
SMTP_FROM='"OTP Bud" <user@mail.com>'
SMTP_PORT=587
SMTP_SECURE=false # Set to true if you're using SMTP Secure
```

### Install Dependencies

Navigate to the `backend` directory and run the following command to install the necessary dependencies:

```bash
    pnpm install
```

### Run docker postgres container

You can run a PostgreSQL container using Docker with the following command:

```bash
    docker compose up -d
```

### Run Migrations

To set up the database schema, run the following command:

```bash
    pnpm db:migrate
    pnpm db:generate
```

### Start the Server

Finally, start the backend server with the following command:

```bash
    pnpm start
```
