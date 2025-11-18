import sequelize from './config/database.js';
import './models/associations.js';

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models
    await sequelize.sync({ force: false }); // Use { force: true } only in development to reset DB
    console.log('Database synchronized successfully.');
    
    console.log('Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
