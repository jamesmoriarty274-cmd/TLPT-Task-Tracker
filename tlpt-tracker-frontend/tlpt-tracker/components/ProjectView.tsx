
import React, { useState } from 'react';
import { Project, Team, User, TaskLayer1 } from '../types';
import Dashboard from './Dashboard';
import TaskItem from './TaskItem';

interface ProjectViewProps {
    project: Project;
    currentUser: User;
    allMasterTasks: TaskLayer1[];
    onUpdateProject: (updatedProject: Project) => void;
    onBack: () => void;
}

const ProjectView: React.FC<ProjectViewProps> = ({ project, currentUser, allMasterTasks, onUpdateProject, onBack }) => {
    const [activeTab, setActiveTab] = useState<Team>(Team.THREAT_INTEL);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [assignUserModal, setAssignUserModal] = useState<TaskLayer1 | null>(null);
    const [usersToAssign, setUsersToAssign] = useState<string[]>([]);

    const isAdmin = currentUser.role === 'admin';

    const handleAddTask = () => {
        const tasksToAdd = allMasterTasks.filter(task => selectedTasks.includes(task.id));
        const newProjectTasks = [...project.tasks];
        tasksToAdd.forEach(task => {
            if (!newProjectTasks.find(pt => pt.id === task.id)) {
                newProjectTasks.push(JSON.parse(JSON.stringify(task))); // Deep copy
            }
        });
        onUpdateProject({ ...project, tasks: newProjectTasks });
        setShowAddTaskModal(false);
        setSelectedTasks([]);
    };

    const handleAssignUsers = () => {
        if (!assignUserModal) return;
        const updatedTasks = project.tasks.map(task => 
            task.id === assignUserModal.id ? { ...task, assignedUsers: usersToAssign } : task
        );
        onUpdateProject({ ...project, tasks: updatedTasks });
        setAssignUserModal(null);
        setUsersToAssign([]);
    };

    const updateMainTask = (updatedTask: TaskLayer1) => {
        const updatedTasks = project.tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
        onUpdateProject({ ...project, tasks: updatedTasks });
    };

    const tasksForCurrentTab = project.tasks.filter(task => task.category === activeTab);
    const masterTasksForCurrentTab = allMasterTasks.filter(task => task.category === activeTab && !project.tasks.some(pt => pt.id === task.id));

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <button onClick={onBack} className="mb-6 text-sm text-primary hover:underline">
                &larr; Back to Projects
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-4xl font-extrabold text-white">{project.name}</h1>
                {isAdmin && (
                    <button onClick={() => setShowAddTaskModal(true)} className="mt-4 md:mt-0 bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        Add Tasks to Project
                    </button>
                )}
            </div>

            <Dashboard project={project} />

            <div className="mt-8">
                <div className="border-b border-gray-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab(Team.THREAT_INTEL)}
                            className={`${activeTab === Team.THREAT_INTEL ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {Team.THREAT_INTEL}
                        </button>
                        <button
                            onClick={() => setActiveTab(Team.RED_TEAM)}
                            className={`${activeTab === Team.RED_TEAM ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {Team.RED_TEAM}
                        </button>
                    </nav>
                </div>
                <div className="mt-6">
                    {tasksForCurrentTab.length > 0 ? tasksForCurrentTab.map(task => (
                        <div key={task.id} className="relative">
                            <TaskItem 
                                task={task} 
                                updateMainTask={updateMainTask} 
                                projectUsers={project.users}
                                currentUser={currentUser}
                            />
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setAssignUserModal(task);
                                        setUsersToAssign(task.assignedUsers);
                                    }}
                                    className="absolute top-4 right-16 bg-secondary hover:bg-purple-500 text-white text-xs font-bold py-1 px-2 rounded"
                                >
                                    Assign Users
                                </button>
                            )}
                        </div>
                    )) : (
                        <p className="text-text-secondary text-center py-8">No {activeTab} tasks in this project yet.</p>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-8 w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <h3 className="text-2xl font-bold mb-4">Add {activeTab} Tasks</h3>
                        <div className="overflow-y-auto flex-grow pr-4">
                        {masterTasksForCurrentTab.map(task => (
                            <div key={task.id} className="flex items-center mb-2 p-2 rounded hover:bg-gray-800">
                                <input
                                    type="checkbox"
                                    id={`task-${task.id}`}
                                    checked={selectedTasks.includes(task.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedTasks(prev => [...prev, task.id]);
                                        } else {
                                            setSelectedTasks(prev => prev.filter(id => id !== task.id));
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor={`task-${task.id}`} className="ml-3 text-sm text-text-primary">{task.name}</label>
                            </div>
                        ))}
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setShowAddTaskModal(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleAddTask} className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">Add Selected</button>
                        </div>
                    </div>
                </div>
            )}
            
            {assignUserModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-8 w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-1">Assign Users to Task</h3>
                        <p className="text-text-secondary mb-4 text-sm">{assignUserModal.name}</p>
                         {project.users.filter(u => u.team === assignUserModal.category).map(user => (
                            <div key={user.id} className="flex items-center mb-2">
                                <input
                                    type="checkbox"
                                    id={`user-${user.id}`}
                                    checked={usersToAssign.includes(user.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setUsersToAssign(prev => [...prev, user.id]);
                                        } else {
                                            setUsersToAssign(prev => prev.filter(id => id !== user.id));
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor={`user-${user.id}`} className="ml-3 text-sm text-text-primary">{user.name} ({user.team})</label>
                            </div>
                         ))}
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setAssignUserModal(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleAssignUsers} className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">Assign</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProjectView;
