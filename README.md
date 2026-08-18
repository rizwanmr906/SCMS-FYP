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

## 5) Default login accounts

The backend seeds default accounts for testing:

- Admin
  - Email: admin@civic.gov.pk
  - Password: Admin@1234

- Electricity Department
  - Email: dept1@civic.gov.pk
  - Password: Dept1@1234

- Gas Department
  - Email: dept2@civic.gov.pk
  - Password: Dept2@1234

- Water Department
  - Email: dept3@civic.gov.pk
  - Password: Dept3@1234

## Notes

- The app uses a local SQLite database created automatically when the backend starts.
- The backend is configured to allow local development access from the frontend through the Vite proxy.
- For production use, change all default credentials and secret values.

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
