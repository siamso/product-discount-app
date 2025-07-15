-- Bundles table to store bundle configurations
CREATE TABLE IF NOT EXISTS bundles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    products TEXT NOT NULL,
    discountType VARCHAR(20) NOT NULL,
    discountValue DECIMAL(10,2) NOT NULL,
    isActive BOOLEAN DEFAULT 1,
    totalValue DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(isActive);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_bundles_updated_at 
    AFTER UPDATE ON bundles
    FOR EACH ROW 
    BEGIN
        UPDATE bundles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END; 