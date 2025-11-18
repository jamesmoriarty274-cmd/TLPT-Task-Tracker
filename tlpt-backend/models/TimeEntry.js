import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TimeEntry = sequelize.define('TimeEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  startTime: {
    type: DataTypes.DATE
  },
  endTime: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'not_applicable'),
    defaultValue: 'not_started'
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  commands: {
    type: DataTypes.TEXT, // Store as JSON string
    defaultValue: '[]'
  },
  tools: {
    type: DataTypes.TEXT, // Store as JSON string
    defaultValue: '[]'
  }
});

export default TimeEntry;
