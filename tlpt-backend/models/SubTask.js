import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SubTask = sequelize.define('SubTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false // 1, 2, or 3 for the three levels
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true // For hierarchical structure
  }
});

export default SubTask;
