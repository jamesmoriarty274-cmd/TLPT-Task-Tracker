
export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum Team {
  THREAT_INTEL = 'Threat Intelligence',
  RED_TEAM = 'Red Team',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface ProjectUser extends User {
  team: Team;
}

export enum SubTaskStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    NOT_APPLICABLE = 'Not Applicable',
}

export interface SubTask {
  id: string;
  name:string;
  startTime?: number;
  stopTime?: number;
  notes: string;
  status: SubTaskStatus;
}

export interface TaskLayer2 {
  id: string;
  name: string;
  subTasks: SubTask[];
}

export interface TaskLayer1 {
  id: string;
  name: string;
  category: Team;
  subCategories: TaskLayer2[];
  assignedUsers: string[];
}

export interface Project {
  id: string;
  name: string;
  users: ProjectUser[];
  tasks: TaskLayer1[];
}