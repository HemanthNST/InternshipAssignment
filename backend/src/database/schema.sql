-- Database Schema for Smart Parking Management System
-- ALL COLUMN NAMES ARE LOWERCASE (PostgreSQL standard)
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('user', 'driver', 'manager', 'superAdmin')
    ),
    profilepicture TEXT,
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT now(),
    updatedat TIMESTAMP DEFAULT now()
);
-- Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehiclenumber VARCHAR(50) UNIQUE NOT NULL,
    vehiclemodel VARCHAR(100) NOT NULL,
    vehicletype VARCHAR(50),
    color VARCHAR(50),
    registrationnumber VARCHAR(50),
    registrationexpiry DATE,
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT now(),
    updatedat TIMESTAMP DEFAULT now()
);
-- Parking Lots Table
CREATE TABLE parkinglots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zipcode VARCHAR(20),
    totalspots INTEGER NOT NULL,
    availablespots INTEGER NOT NULL,
    manageruserid UUID REFERENCES users(id) ON DELETE
    SET NULL,
        isactive BOOLEAN DEFAULT true,
        createdat TIMESTAMP DEFAULT now(),
        updatedat TIMESTAMP DEFAULT now()
);
-- Sites Table (Parking Lots alternative naming)
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zipcode VARCHAR(20),
    totalspots INTEGER NOT NULL,
    availablespots INTEGER NOT NULL,
    manageruserid UUID REFERENCES users(id) ON DELETE
    SET NULL,
        isactive BOOLEAN DEFAULT true,
        createdat TIMESTAMP DEFAULT now(),
        updatedat TIMESTAMP DEFAULT now()
);
-- Parking Spots Table
CREATE TABLE parkingspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parkinglotid UUID NOT NULL REFERENCES parkinglots(id) ON DELETE CASCADE,
    spotnumber VARCHAR(50) NOT NULL,
    floor INTEGER,
    spottype VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available' CHECK (
        status IN ('available', 'occupied', 'maintenance')
    ),
    lastoccupiedby UUID REFERENCES users(id) ON DELETE
    SET NULL,
        createdat TIMESTAMP DEFAULT now(),
        updatedat TIMESTAMP DEFAULT now()
);
-- Valets Table
CREATE TABLE valets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    siteid UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    parkingscompleted INTEGER DEFAULT 0,
    retrievalscompleted INTEGER DEFAULT 0,
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT now(),
    updatedat TIMESTAMP DEFAULT now()
);
-- Assignments Table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driverid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sessionid UUID REFERENCES parkingsessions(id) ON DELETE CASCADE,
    vehicleid UUID REFERENCES vehicles(id) ON DELETE
    SET NULL,
        siteid UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        customername VARCHAR(255),
        parkinglevel VARCHAR(50),
        type VARCHAR(50) NOT NULL CHECK (type IN ('park', 'retrieve')),
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed')),
        assignedat TIMESTAMP NOT NULL,
        completedat TIMESTAMP,
        createdat TIMESTAMP DEFAULT now(),
        updatedat TIMESTAMP DEFAULT now()
);
-- Parking Sessions Table
CREATE TABLE parkingsessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicleid UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    parkingspotid UUID REFERENCES parkingspots(id) ON DELETE
    SET NULL,
        siteid UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
        valetid UUID REFERENCES valets(id) ON DELETE
    SET NULL,
        entrytime TIMESTAMP NOT NULL,
        exittime TIMESTAMP,
        durationminutes INTEGER,
        amountcharged DECIMAL(10, 2),
        amount DECIMAL(10, 2),
        paymentmethodused VARCHAR(50),
        paymentmethod VARCHAR(50),
        ticketid VARCHAR(255) UNIQUE,
        parkinglevel VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ongoing' CHECK (
            status IN (
                'ongoing',
                'completed',
                'cancelled',
                'parked',
                'retrieved',
                'in-progress'
            )
        ),
        ispaid BOOLEAN DEFAULT false,
        createdat TIMESTAMP DEFAULT now(),
        updatedat TIMESTAMP DEFAULT now()
);
-- Payment Methods Table
CREATE TABLE paymentmethods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paymenttype VARCHAR(50) NOT NULL CHECK (
        paymenttype IN ('UPI', 'Netbanking', 'Cash', 'Card')
    ),
    paymentdetails TEXT,
    isdefault BOOLEAN DEFAULT false,
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT now(),
    updatedat TIMESTAMP DEFAULT now()
);
-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parkingsessionid UUID NOT NULL REFERENCES parkingsessions(id) ON DELETE CASCADE,
    paymentmethodid UUID REFERENCES paymentmethods(id) ON DELETE
    SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transactiontype VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        transactionreference VARCHAR(255) UNIQUE,
        createdat TIMESTAMP DEFAULT now(),
        updatedat TIMESTAMP DEFAULT now()
);
-- Rates Table
CREATE TABLE rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parkinglotid UUID NOT NULL REFERENCES parkinglots(id) ON DELETE CASCADE,
    vehicletype VARCHAR(50),
    baserateperhour DECIMAL(10, 2) NOT NULL,
    maxdailyrate DECIMAL(10, 2),
    isactive BOOLEAN DEFAULT true,
    createdat TIMESTAMP DEFAULT now(),
    updatedat TIMESTAMP DEFAULT now()
);
-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notificationtype VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    isread BOOLEAN DEFAULT false,
    createdat TIMESTAMP DEFAULT now()
);
-- Driver Approvals Table
CREATE TABLE driverapprovals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    licensenumber VARCHAR(100) UNIQUE,
    experience VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submittedat TIMESTAMP DEFAULT now(),
    approvedat TIMESTAMP,
    reviewedby UUID REFERENCES users(id) ON DELETE
    SET NULL,
        createdat TIMESTAMP DEFAULT now(),
        updatedat TIMESTAMP DEFAULT now()
);
-- Audit Log Table
CREATE TABLE auditlog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userid UUID REFERENCES users(id) ON DELETE
    SET NULL,
        action VARCHAR(255),
        entitytype VARCHAR(100),
        entityid UUID,
        oldvalues JSONB,
        newvalues JSONB,
        createdat TIMESTAMP DEFAULT now()
);
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vehicles_userid ON vehicles(userid);
CREATE INDEX idx_parkingspots_status ON parkingspots(status);
CREATE INDEX idx_parkingsessions_userid ON parkingsessions(userid);
CREATE INDEX idx_parkingsessions_siteid ON parkingsessions(siteid);
CREATE INDEX idx_parkingsessions_status ON parkingsessions(status);
CREATE INDEX idx_parkingsessions_ticketid ON parkingsessions(ticketid);
CREATE INDEX idx_transactions_userid ON transactions(userid);
CREATE INDEX idx_notifications_userid ON notifications(userid);
CREATE INDEX idx_auditlog_userid ON auditlog(userid);
CREATE INDEX idx_auditlog_createdat ON auditlog(createdat);
CREATE INDEX idx_assignments_driverid ON assignments(driverid);
CREATE INDEX idx_assignments_siteid ON assignments(siteid);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_valets_siteid ON valets(siteid);