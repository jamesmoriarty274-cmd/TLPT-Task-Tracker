import sequelize from './config/database.js';

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Direct SQL insertion to avoid model complexities
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count FROM Users WHERE username = 'admin'
    `);
    
    if (results[0].count > 0) {
      console.log('Admin user already exists.');
      return;
    }

    // Insert admin user directly (you'll need to adjust fields based on your User model)
    await sequelize.query(`
      INSERT INTO Users (username, email, password, role, createdAt, updatedAt) 
      VALUES ('admin', 'admin@tlpt.com', 'admin123', 'admin', datetime('now'), datetime('now'))
    `);

    console.log('Admin user created successfully!');
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
