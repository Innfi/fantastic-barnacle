CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(255) NOT NULL,
  targetProductId INT NOT NULL,
  discountRate DECIMAL(5,2) NOT NULL,
  validUntil DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME
);