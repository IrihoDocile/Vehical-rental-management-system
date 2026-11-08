CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(60) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(160) NOT NULL,
  vehicle_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('Pending','Approved','Rejected','Completed') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

INSERT INTO vehicles (name, type, price_per_day, image_url, available)
SELECT * FROM (
  SELECT 'Toyota Corolla', 'Sedan', 45000.00, 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=900', TRUE
  UNION ALL SELECT 'Toyota RAV4', 'SUV', 75000.00, 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=900', TRUE
  UNION ALL SELECT 'Hyundai Tucson', 'SUV', 70000.00, 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=900', TRUE
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM vehicles);
