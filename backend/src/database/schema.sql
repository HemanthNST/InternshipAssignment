-- // Database Schema for Smart Parking Management System // All field names should be in camelCase -- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (
        role IN ('user', 'driver', 'manager', 'superAdmin')
    ),
    profilePicture TEXT,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT now(),
    updatedAt TIMESTAMP DEFAULT now()
);
-- Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicleNumber VARCHAR(50) UNIQUE NOT NULL,
    vehicleModel VARCHAR(100) NOT NULL,
    vehicleType VARCHAR(50),
    color VARCHAR(50),
    registrationNumber VARCHAR(50),
    registrationExpiry DATE,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT now(),
    updatedAt TIMESTAMP DEFAULT now()
);
-- Parking Lots Table
CREATE TABLE parkingLots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zipCode VARCHAR(20),
    totalSpots INTEGER NOT NULL,
    availableSpots INTEGER NOT NULL,
    managerUserId UUID REFERENCES users(id) ON DELETE
    SET NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT now(),
        updatedAt TIMESTAMP DEFAULT now()
);
-- Parking Spots Table
CREATE TABLE parkingSpots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parkingLotId UUID NOT NULL REFERENCES parkingLots(id) ON DELETE CASCADE,
    spotNumber VARCHAR(50) NOT NULL,
    floor INTEGER,
    spotType VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available' CHECK (
        status IN ('available', 'occupied', 'maintenance')
    ),
    lastOccupiedBy UUID REFERENCES users(id) ON DELETE
    SET NULL,
        createdAt TIMESTAMP DEFAULT now(),
        updatedAt TIMESTAMP DEFAULT now()
);
-- Parking Sessions Table
CREATE TABLE parkingSessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicleId UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    parkingSpotId UUID NOT NULL REFERENCES parkingSpots(id) ON DELETE
    SET NULL,
        parkingLotId UUID NOT NULL REFERENCES parkingLots(id) ON DELETE CASCADE,
        entryTime TIMESTAMP NOT NULL,
        exitTime TIMESTAMP,
        durationMinutes INTEGER,
        amountCharged DECIMAL(10, 2),
        paymentMethodUsed VARCHAR(50),
        status VARCHAR(50) DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed', 'cancelled')),
        createdAt TIMESTAMP DEFAULT now(),
        updatedAt TIMESTAMP DEFAULT now()
);
-- Payment Methods Table
CREATE TABLE paymentMethods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paymentType VARCHAR(50) NOT NULL CHECK (
        paymentType IN ('UPI', 'Netbanking', 'Cash', 'Card')
    ),
    paymentDetails TEXT,
    isDefault BOOLEAN DEFAULT false,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT now(),
    updatedAt TIMESTAMP DEFAULT now()
);
-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parkingSessionId UUID NOT NULL REFERENCES parkingSessions(id) ON DELETE CASCADE,
    paymentMethodId UUID REFERENCES paymentMethods(id) ON DELETE
    SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transactionType VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        transactionReference VARCHAR(255) UNIQUE,
        createdAt TIMESTAMP DEFAULT now(),
        updatedAt TIMESTAMP DEFAULT now()
);
-- Rates Table
CREATE TABLE rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parkingLotId UUID NOT NULL REFERENCES parkingLots(id) ON DELETE CASCADE,
    vehicleType VARCHAR(50),
    baseRatePerHour DECIMAL(10, 2) NOT NULL,
    maxDailyRate DECIMAL(10, 2),
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT now(),
    updatedAt TIMESTAMP DEFAULT now()
);
-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notificationType VARCHAR(100),
    title VARCHAR(255),
    message TEXT,
    isRead BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT now()
);
-- Audit Log Table
CREATE TABLE auditLog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID REFERENCES users(id) ON DELETE
    SET NULL,
        action VARCHAR(255),
        entityType VARCHAR(100),
        entityId UUID,
        oldValues JSONB,
        newValues JSONB,
        createdAt TIMESTAMP DEFAULT now()
);
-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_vehicles_userId ON vehicles(userId);
CREATE INDEX idx_parkingSpots_status ON parkingSpots(status);
CREATE INDEX idx_parkingSessions_userId ON parkingSessions(userId);
CREATE INDEX idx_parkingSessions_status ON parkingSessions(status);
CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_notifications_userId ON notifications(userId);
CREATE INDEX idx_auditLog_userId ON auditLog(userId);
CREATE INDEX idx_auditLog_createdAt ON auditLog(createdAt);