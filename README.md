# Streamer Tracker - PostgreSQL Backend Setup

## Prerequisites

1. **PostgreSQL** must be installed and running
   - Download from: https://www.postgresql.org/download/
   - Default port: 5432

2. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/

## Database Setup

### Step 1: Create Database

Open PostgreSQL command line (psql) or use pgAdmin:

```sql
CREATE DATABASE streamer_tracker;
```

### Step 2: Configure Environment

Edit `server/.env` file with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=streamer_tracker
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### Step 3: Run Migrations

Execute the SQL migration file to create tables:

**Option A: Using psql command line:**
```bash
psql -U postgres -d streamer_tracker -f server/migrations/001_create_tables.sql
```

**Option B: Using pgAdmin:**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Select the `streamer_tracker` database
4. Open Query Tool
5. Open and run `server/migrations/001_create_tables.sql`

## Backend Setup

### Step 1: Install Dependencies

Navigate to the server directory and install packages:

```bash
cd server
npm install
```

### Step 2: Start the Server

```bash
npm start
```

You should see:
```
==================================================
🌟 Streamer Tracker Backend Server 🌟
==================================================
📡 Server running on: http://localhost:3000
🗄️  Database: streamer_tracker
🌍 Environment: development
==================================================
```

## Access the Application

1. Open your browser
2. Navigate to: **http://localhost:3000**
3. The app will now use PostgreSQL for data persistence!

## Testing the API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Get All Streamers
```bash
curl http://localhost:3000/api/streamers
```

### Add a Streamer
```bash
curl -X POST http://localhost:3000/api/streamers \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"TestStreamer\",\"platform\":\"YouTube\",\"initialCount\":1000}"
```

## Troubleshooting

### "Connection refused" error
- Make sure PostgreSQL is running
- Check that the database exists
- Verify credentials in `.env` file

### "relation does not exist" error
- Run the migrations: `psql -U postgres -d streamer_tracker -f server/migrations/001_create_tables.sql`

### Port 3000 already in use
- Change the PORT in `server/.env` to a different number (e.g., 3001)
- Update API_BASE in frontend if needed

## Project Structure

```
track-streamers/
├── index.html              # Frontend HTML
├── styles.css              # Frontend styles
├── app.js                  # Frontend JavaScript (now uses API)
├── logo.png               # App logo
└── server/
    ├── package.json        # Node.js dependencies
    ├── .env               # Environment variables (DO NOT COMMIT)
    ├── .env.example       # Environment template
    ├── server.js          # Express server
    ├── config/
    │   └── database.js    # PostgreSQL connection pool
    ├── routes/
    │   └── streamers.js   # API endpoints
    └── migrations/
        └── 001_create_tables.sql  # Database schema
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/streamers` | Get all streamers |
| POST | `/api/streamers` | Create new streamer |
| PUT | `/api/streamers/:id` | Update streamer |
| DELETE | `/api/streamers/:id` | Delete streamer |
| POST | `/api/streamers/:id/subscribers` | Add subscriber count |

## Notes

- All data is now stored in PostgreSQL instead of browser localStorage
- The server must be running for the app to work
- Stop server with `Ctrl+C`
