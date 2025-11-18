import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProjectMember = sequelize.define('ProjectMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  team: {
    type: DataTypes.ENUM('threat_intel', 'red_team'),
    allowNull: false
  }
});

export default ProjectMember;
