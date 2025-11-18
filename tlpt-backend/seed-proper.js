import sequelize from './config/database.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check if admin exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count FROM Users WHERE username = 'admin'
    `);
    
    if (results[0].count > 0) {
      console.log('Admin user already exists, updating password...');
      // Update existing admin with hashed password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await sequelize.query(`
        UPDATE Users SET password = ? WHERE username = 'admin'
      `, { replacements: [hashedPassword] });
    } else {
      // Create new admin with hashed password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await sequelize.query(`
        INSERT INTO Users (username, email, password, role, createdAt, updatedAt) 
        VALUES ('admin', 'admin@tlpt.com', ?, 'admin', datetime('now'), datetime('now'))
      `, { replacements: [hashedPassword] });
    }

    console.log('Admin user created/updated successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@tlpt.com');
    
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
