import sequelize from './config/database.js';
import bcrypt from 'bcrypt';
import { User } from './models/index.js';

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@tlpt.com',
      password: hashedPassword,
      role: 'admin'
    });

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
