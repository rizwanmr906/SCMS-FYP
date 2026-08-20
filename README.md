# Smart Complaint Management System (SCMS)

A secure civic complaint management platform with role-based access for citizens, departments, and admins. The project includes a FastAPI backend, React + Vite frontend, SQLite database, and a local ML-based complaint routing model.

## Features

- Citizen complaint submission and tracking
- Department dashboard with complaint queue and status updates
- Admin dashboard for system oversight
- Secure authentication with hashed passwords
- Role-based authorization
- Local ML department routing for complaint classification
- Modern responsive UI with English and Urdu support

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: FastAPI, SQLite
- ML: local transformer model under Model/xlmr_final_model

## Project Structure

- backend/app/main.py — FastAPI API and business logic
- database/schema.sql — database schema reference
- src/ — frontend source files
- Model/xlmr_final_model/ — local complaint classification model
- index.html — app entry point
- package.json — frontend scripts and dependencies
- .venv/ — Python virtual environment

## Prerequisites

- Node.js 18+
- Python 3.10+
- npm
- Windows PowerShell, Git Bash, or a similar terminal

## 1) Install frontend dependencies

From the project root:

```powershell
npm install
```

## 2) Set up the Python environment

From the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
```

## 3) Start the backend

From the project root:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will run at:

- http://127.0.0.1:8000

## 4) Start the frontend

Open a new terminal and run:

```powershell
npm run dev -- --host 0.0.0.0 --port 3000
```

The frontend will run at:

- http://localhost:3000

If port 3000 is already occupied, Vite may switch to the next available port such as 3001.

## 5) Configure login accounts

Set the admin and department credentials in your local `.env` file. Never commit `.env`; use `.env.example` as the template and replace every placeholder with unique values.

## Notes

- The app uses a local SQLite database created automatically when the backend starts.
- The backend is configured to allow local development access from the frontend through the Vite proxy.
- Keep `.env` private and rotate all credentials and `APP_SECRET_KEY` before deployment.
- The API accepts browser requests only from the local Vite origins `localhost:3000` and `127.0.0.1:3000`.

## Useful commands

Run frontend build:

```powershell
npm run build
```

Run preview build locally:

```powershell
npm run preview -- --host 0.0.0.0 --port 4173
```

## Troubleshooting

If the backend fails to start:

- confirm the Python virtual environment was created successfully
- verify requirements are installed:

```powershell
.\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

If the frontend cannot connect to the API:

- confirm the backend is running on port 8000
- ensure the frontend is using the correct proxy settings in Vite

## License

This project is for educational and internal project use unless a separate license is supplied by the project owner.
