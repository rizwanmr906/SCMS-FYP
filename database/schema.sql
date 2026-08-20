CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Citizen', 'Admin', 'Dept_Official'))
);

CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    citizen_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    detected_language VARCHAR(30) NOT NULL,
    routed_department VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'AI Routed', 'In Progress', 'Resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_history (
    audit_id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    updated_by VARCHAR(100) NOT NULL,
    old_status VARCHAR(20) NOT NULL,
    new_status VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_audit_complaint ON audit_history(complaint_id);
