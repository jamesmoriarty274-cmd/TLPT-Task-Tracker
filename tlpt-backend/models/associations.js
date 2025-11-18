import User from './User.js';
import Project from './Project.js';
import ProjectMember from './ProjectMember.js';
import Task from './Task.js';
import SubTask from './SubTask.js';
import TimeEntry from './TimeEntry.js';

// Project Associations
Project.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });
Project.hasMany(ProjectMember, { onDelete: 'CASCADE' });
Project.hasMany(Task, { onDelete: 'CASCADE' });

// ProjectMember Associations
ProjectMember.belongsTo(Project);
ProjectMember.belongsTo(User);

// Task Associations
Task.belongsTo(Project);
Task.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
Task.hasMany(SubTask, { onDelete: 'CASCADE' });

// SubTask Associations (Hierarchical)
SubTask.belongsTo(Task);
SubTask.belongsTo(SubTask, { as: 'parent', foreignKey: 'parentId' });
SubTask.hasMany(SubTask, { as: 'children', foreignKey: 'parentId' });
SubTask.belongsToMany(User, { through: 'SubTaskAssignments' });
SubTask.hasMany(TimeEntry, { onDelete: 'CASCADE' });

// TimeEntry Associations
TimeEntry.belongsTo(SubTask);
TimeEntry.belongsTo(User);

// User Associations
User.hasMany(Project, { as: 'adminProjects', foreignKey: 'adminId' });
User.hasMany(ProjectMember, { onDelete: 'CASCADE' });
User.hasMany(Task, { as: 'createdTasks', foreignKey: 'createdById' });
User.belongsToMany(SubTask, { through: 'SubTaskAssignments' });
User.hasMany(TimeEntry, { onDelete: 'CASCADE' });

export {
  User,
  Project,
  ProjectMember,
  Task,
  SubTask,
  TimeEntry
};
