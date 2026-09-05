# Smart Complaint Management System

Smart Complaint Management System (SCMS) is a responsive React and FastAPI application for submitting, classifying, routing, and tracking civic utility complaints.

The system supports:

- Citizen signup, login, profiles, and complaint history
- Admin complaint and user management
- Department queues for Electricity, Gas, and Water
- AI-assisted complaint classification with keyword fallback
- Complaint status tracking and event history
- English, Urdu, and Roman Urdu interface options
- Optional voice-note complaint submission
- Supabase PostgreSQL persistence

## Project Structure

```text
src/                  React frontend
backend/app/main.py   FastAPI backend
database/schema.sql   Database reference schema
Model/                Local XLM-R model files
```

## Requirements

- Node.js 18 or newer
- Python 3.11 or newer
- A Supabase project with the application tables created
- Git

## Supabase Database

Create the following tables in Supabase SQL Editor using the project database SQL:

```text
departments
users
sessions
complaints
complaint_events
```

The `departments` table must contain these rows:

```text
1 - Electricity
2 - Gas
3 - Water
```

The backend uses PostgreSQL through `psycopg` and a connection pool. It does not create the schema automatically.

## Environment Configuration

Copy the example file:

```powershell
Copy-Item .env.example .env
```

Set these values in `.env`:

```env
APP_SECRET_KEY=use-a-long-random-secret
SESSION_TTL_MINUTES=10080

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-strong-password
DEPARTMENT_1_EMAIL=department1@example.com
DEPARTMENT_1_PASSWORD=use-a-strong-password
DEPARTMENT_2_EMAIL=department2@example.com
DEPARTMENT_2_PASSWORD=use-a-strong-password
DEPARTMENT_3_EMAIL=department3@example.com
DEPARTMENT_3_PASSWORD=use-a-strong-password

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
MODEL_PATH=Model/xlmr_final_model
```

Use the PostgreSQL connection string from Supabase. Percent-encode special characters in the password, such as `@` to `%40` and `#` to `%23`.

Never commit `.env`, database passwords, Supabase service keys, or model credentials.

## Run Locally

### Backend

From the project root, create and activate the virtual environment:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

Start FastAPI:

```powershell
uvicorn backend.app.main:app --reload --port 8000
```

Backend URLs:

- API: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`
- API documentation: `http://127.0.0.1:8000/docs`

### Frontend

Open a second terminal in the project root:

```powershell
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

The Vite development server proxies `/api` requests to the local FastAPI server at port `8000`.

## Test the Application

Verify these workflows after starting both servers:

1. Create a citizen account.
2. Log in as a citizen and submit a complaint.
3. Confirm the complaint appears in Supabase `complaints` and `complaint_events`.
4. Log in as the relevant department and update the complaint status.
5. Log in as an administrator and review the dashboard.
6. Test profile updates, complaint deletion, logout, and language switching.
7. Check the application at a mobile viewport.

Useful validation commands:

```powershell
python -m py_compile backend/app/main.py
npm run build
```

## AI Model

The backend loads the model from:

```text
Model/xlmr_final_model
```

Set a different location with:

```env
MODEL_PATH=C:\path\to\xlmr_final_model
```

If the model is unavailable, the backend uses the built-in keyword classifier fallback. The model directory is ignored by Git because model files can be large.

## Deployment

### Frontend on Vercel

Use these Vercel settings:

```text
Framework: Vite
Build command: npm run build
Output directory: dist
Install command: npm install
```

Add this Vercel environment variable:

```env
VITE_API_URL=https://your-backend.example.com/api
```

The frontend uses `/api` locally through the Vite proxy. In production, `VITE_API_URL` points requests to the deployed FastAPI service.

### Backend on Hugging Face Spaces

Deploy the FastAPI backend as a Docker Space or use another Python hosting provider. The production server must listen on the hosting platform's assigned port, commonly `7860` for Hugging Face Docker Spaces.

Set all backend environment variables in the hosting provider's secret manager. Do not upload `.env` or expose the Supabase database password in frontend code.

Set these backend deployment variables:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres
APP_SECRET_KEY=use-a-long-random-secret
FRONTEND_URL=https://your-project.vercel.app
CORS_ORIGINS=https://your-project.vercel.app
MODEL_PATH=/app/Model/xlmr_final_model
```

## Security Notes

- Keep `.env` private.
- Keep Supabase service-role or database keys on the backend only.
- Use strong, unique admin and department passwords.
- Rotate any credential that has been shared or committed.
- Enable Row Level Security for tables when using Supabase client access directly.
- The current backend uses the PostgreSQL connection string server-side, so database credentials must never be placed in Vite variables.

## Common Commands

```powershell
# Start backend
uvicorn backend.app.main:app --reload --port 8000

# Start frontend
npm run dev

# Build frontend
npm run build

# Preview production frontend
npm run preview
```
uvicorn app.main:app --reload --port 8000
uvicorn backend.app.main:app --reload --port 8000