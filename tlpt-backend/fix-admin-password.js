import sequelize from './config/database.js';
import bcrypt from 'bcryptjs';

async function fixAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Hash the password properly
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the admin user with hashed password
    await sequelize.query(`
      UPDATE Users SET password = ? WHERE username = 'admin'
    `, { replacements: [hashedPassword] });

    console.log('Admin password updated successfully!');
    console.log('Username: admin');
    console.log('Password: admin123 (now properly hashed)');
    
    // Verify the update
    const [results] = await sequelize.query(`
      SELECT username, password FROM Users WHERE username = 'admin'
    `);
    console.log('Updated password hash:', results[0].password);
    
  } catch (error) {
    console.error('Error fixing admin password:', error);
  } finally {
    await sequelize.close();
  }
}

fixAdminPassword();
