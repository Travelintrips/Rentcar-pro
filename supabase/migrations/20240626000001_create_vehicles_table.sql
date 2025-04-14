-- Create vehicles table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vehicle_name TEXT,
  model TEXT,
  type TEXT,
  daily_rate NUMERIC,
  image_url TEXT,
  seats INTEGER,
  transmission TEXT,
  fuel_type TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  features JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE vehicles;

-- Insert sample data if the table is empty
INSERT INTO vehicles (vehicle_name, model, type, daily_rate, image_url, seats, transmission, fuel_type, is_available, features)
SELECT
  'Toyota Avanza', 'Avanza', 'sedan', 350000, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', 7, 'automatic', 'petrol', TRUE, '["AC", "Bluetooth", "Backup Camera"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM vehicles LIMIT 1);

INSERT INTO vehicles (vehicle_name, model, type, daily_rate, image_url, seats, transmission, fuel_type, is_available, features)
SELECT
  'Honda CR-V', 'CR-V', 'suv', 500000, 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80', 5, 'automatic', 'petrol', TRUE, '["AC", "Bluetooth", "GPS", "Leather Seats"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 2);

INSERT INTO vehicles (vehicle_name, model, type, daily_rate, image_url, seats, transmission, fuel_type, is_available, features)
SELECT
  'Mitsubishi Pajero', 'Pajero', 'suv', 750000, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', 7, 'automatic', 'diesel', TRUE, '["AC", "Bluetooth", "GPS", "4WD", "Leather Seats"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 3);

INSERT INTO vehicles (vehicle_name, model, type, daily_rate, image_url, seats, transmission, fuel_type, is_available, features)
SELECT
  'Toyota Alphard', 'Alphard', 'luxury', 1200000, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', 7, 'automatic', 'petrol', FALSE, '["AC", "Bluetooth", "GPS", "Leather Seats", "Sunroof", "Premium Audio"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 4);

INSERT INTO vehicles (vehicle_name, model, type, daily_rate, image_url, seats, transmission, fuel_type, is_available, features)
SELECT
  'Mitsubishi L300', 'L300', 'truck', 400000, 'https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?w=800&q=80', 3, 'manual', 'diesel', TRUE, '["AC", "Cargo Space"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 5);

INSERT INTO vehicles (vehicle_name, model, type, daily_rate, image_url, seats, transmission, fuel_type, is_available, features)
SELECT
  'Tesla Model 3', 'Model 3', 'sedan', 1500000, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80', 5, 'automatic', 'electric', TRUE, '["Autopilot", "Premium Audio", "Supercharging", "Glass Roof"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 6);
