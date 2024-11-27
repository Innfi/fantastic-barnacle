CREATE TABLE messageHistories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  messageId INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deletedAt DATETIME
);
