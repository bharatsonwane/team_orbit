CREATE TABLE IF NOT EXISTS employee_address (
    id SERIAL PRIMARY KEY,
    "employeeId" INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zipCode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    CONSTRAINT fk_employee_address_employee FOREIGN KEY ("employeeId") REFERENCES employee (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS employee_skill (
    id SERIAL PRIMARY KEY,
    "employeeId" INT NOT NULL,
    skill VARCHAR(100) NOT NULL,
    proficiency VARCHAR(50) DEFAULT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    CONSTRAINT fk_employee_skill_employee FOREIGN KEY ("employeeId") REFERENCES employee (id) ON DELETE CASCADE,
    CONSTRAINT unique_employee_skill UNIQUE ("employeeId", skill)
);
CREATE TABLE IF NOT EXISTS employee_salary_history (
    id SERIAL PRIMARY KEY,
    "employeeId" INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    CONSTRAINT fk_employee_salary_history_employee FOREIGN KEY ("employeeId") REFERENCES employee (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS employee_documents (
    id SERIAL PRIMARY KEY,
    "employeeId" INT NOT NULL,
    documentType VARCHAR(100) NOT NULL,
    filePath VARCHAR(255) NOT NULL,
    "uploadedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL,
    CONSTRAINT fk_employee_documents_employee FOREIGN KEY ("employeeId") REFERENCES employee (id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS employee_leave_balance (
    id SERIAL PRIMARY KEY,
    "employeeId" INT NOT NULL,
    year INT NOT NULL,
    totalDays INT NOT NULL,
    usedDays INT DEFAULT 0 NOT NULL,
    remainingDays INT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    CONSTRAINT fk_employee_leave_balance_employee FOREIGN KEY ("employeeId") REFERENCES employee (id) ON DELETE CASCADE,
    CONSTRAINT unique_employee_year UNIQUE ("employeeId", year)
);
CREATE TABLE IF NOT EXISTS employee_leave_request (
    id SERIAL PRIMARY KEY,
    "employeeId" INT NOT NULL,
    "leaveTypeId" INT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    "requestedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "approvedAt" TIMESTAMP DEFAULT NULL,
    "rejectedAt" TIMESTAMP DEFAULT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    CONSTRAINT fk_employee_leave_request_employee FOREIGN KEY ("employeeId") REFERENCES employee (id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_leave_request_leave_type FOREIGN KEY ("leaveTypeId") REFERENCES lookup (id)
);
CREATE TABLE IF NOT EXISTS employee_attendance (
    id SERIAL PRIMARY KEY,
    "employeeId" INT NOT NULL,
    "date" DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'PRESENT' NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
    "createdBy" INT DEFAULT NULL,
    "updatedBy" INT DEFAULT NULL,
    CONSTRAINT fk_employee_attendance_employee FOREIGN KEY ("employeeId") REFERENCES employee (id) ON DELETE CASCADE
);