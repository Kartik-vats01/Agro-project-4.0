-- Step 1: Create the database first
CREATE DATABASE AgriDB;
GO

-- Step 2: Switch to it
USE AgriDB;
GO

-- Step 3: Create Farmers table
CREATE TABLE Farmers (
    id            INT PRIMARY KEY IDENTITY(1,1),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password      VARCHAR(255) NOT NULL,
    phone         VARCHAR(15),
    location      VARCHAR(100),
    land_acres    FLOAT NULL,
    soil_type     VARCHAR(50),
    soil_ph       FLOAT,
    irrigation    VARCHAR(50),
    selected_crop VARCHAR(100) NULL,
    created_at    DATETIME DEFAULT GETDATE()
);
GO

-- Step 4: Verify
SELECT * FROM Farmers;
GO