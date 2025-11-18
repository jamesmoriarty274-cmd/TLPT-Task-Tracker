import React, { useState, useRef } from 'react';
import { Project, User, Team, TaskLayer1, Role, SubTaskStatus } from '../types';
import { api } from '../api';
import { TrashIcon, ChevronDownIcon, DatabaseIcon, DownloadIcon, UploadIcon, RefreshIcon } from './icons';

interface AdminViewProps {
    projects: Project[];
    allUsers: User[];
    masterTasks: TaskLayer1[];
    onSelectProject: (project: Project) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ projects, allUsers, masterTasks, onSelectProject }) => {
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    
    const [confirmation, setConfirmation] = useState<{
        title: string;
        message: React.ReactNode;
        onConfirm: () => void;
        confirmText?: string;
        confirmColor?: 'primary' | 'danger';
    } | null>(null);

    const importInputRef = useRef<HTMLInputElement>(null);

    const [expandedCategories, setExpandedCategories] = useState<Record<Team, boolean>>({
        [Team.THREAT_INTEL]: true,
        [Team.RED_TEAM]: true,
    });

    // Project Modal State - SIMPLIFIED
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<Record<string, Team>>({});

    // Task Modal State
    const [newTask, setNewTask] = useState<Omit<TaskLayer1, 'id' | 'assignedUsers'>>({
        name: '',
        category: Team.THREAT_INTEL,
        subCategories: [{ id: crypto.randomUUID(), name: '', subTasks: [{ id: crypto.randomUUID(), name: '', notes: '', status: SubTaskStatus.PENDING }] }]
    });

    // User Modal State
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<Role>(Role.USER);

    const handleCreateProject = async () => {
        try {
            // Validate project name only
            if (!newProjectName.trim()) {
                alert('Please enter a project name');
                return false;
            }

            // Convert selectedUsers to team members
            const teamMembers = Object.entries(selectedUsers).map(([userId, team]) => ({
                userId: parseInt(userId),
                team: team
            }));

            // Clean project data - NO CATEGORY FIELD
            const projectData = {
                name: newProjectName.trim(),
                teamMembers: teamMembers
            };

            console.log('Creating project with data:', projectData);

            const response = await api.createProject(projectData);
            
            if (response.success) {
                // Reset form
                setNewProjectName('');
                setSelectedUsers({});
                setShowProjectModal(false);
                window.location.reload();
            } else {
                alert(response.message || 'Failed to create project');
            }
            return response.success;
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
            return false;
        }
    };
    
    const handleCreateTask = async () => {
        if (!newTask.name) return;
        
        try {
            const completeTask = {
                ...newTask,
                assignedUsers: []
            };
            
            const response = await api.createTask(completeTask);
            
            if (response.success) {
                setShowTaskModal(false);
                setNewTask({
                    name: '',
                    category: Team.THREAT_INTEL,
                    subCategories: [{ id: crypto.randomUUID(), name: '', subTasks: [{ id: crypto.randomUUID(), name: '', notes: '', status: SubTaskStatus.PENDING }] }]
                });
                window.location.reload();
            } else {
                alert(response.message || 'Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Failed to create task');
        }
    };

    const handleCreateUser = async () => {
        if (!newUserName || !newUserEmail || !newUserPassword) {
            alert('Please fill all user fields.');
            return;
        }
        
        try {
            const response = await api.createUser({
                username: newUserName,
                email: newUserEmail,
                password: newUserPassword,
                role: newUserRole,
            });
            
            if (response.success) {
                setShowUserModal(false);
                setNewUserName('');
                setNewUserEmail('');
                setNewUserPassword('');
                setNewUserRole(Role.USER);
                window.location.reload();
            } else {
                alert(response.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user');
        }
    };

    const handleDeleteClick = (item: { type: 'project' | 'task' | 'user', id: string, name: string }) => {
        let onConfirmAction: () => void;
        
        if (item.type === 'project') {
            onConfirmAction = async () => {
                const response = await api.delete(`projects/${item.id}`);
                if (response.success) {
                    window.location.reload();
                } else {
                    alert(response.message || 'Failed to delete project');
                }
            };
        } else if (item.type === 'task') {
            onConfirmAction = async () => {
                const response = await api.delete(`tasks/${item.id}`);
                if (response.success) {
                    window.location.reload();
                } else {
                    alert(response.message || 'Failed to delete task');
                }
            };
        } else if (item.type === 'user') {
            const userToDelete = allUsers.find(u => u.id === item.id);
            if (userToDelete && allUsers.filter(u => u.role === Role.ADMIN).length === 1 && userToDelete.role === Role.ADMIN) {
                 alert("Cannot delete the last admin user.");
                 return;
            }
            onConfirmAction = async () => {
                const response = await api.deleteUser(item.id);
                if (response.success) {
                    window.location.reload();
                } else {
                    alert(response.message || 'Failed to delete user');
                }
            };
        } else {
            return;
        }
    
        setConfirmation({
            title: `Delete ${item.type}`,
            message: <>Are you sure you want to delete the {item.type} <strong className="text-text-primary">"{item.name}"</strong>? This action cannot be undone.</>,
            confirmText: 'Delete',
            confirmColor: 'danger',
            onConfirm: () => {
                onConfirmAction();
                setConfirmation(null);
            }
        });
    };

    // Data Management handlers
    const handleExport = async () => {
        try {
            const response = await api.exportAllData();
            if (response.success) {
                const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tlpt-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert(response.message || 'Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed');
        }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                setConfirmation({
                    title: 'Import Data',
                    message: 'Are you sure you want to import this file? This will overwrite all existing projects, users, and tasks. This action cannot be undone.',
                    confirmText: 'Import & Overwrite',
                    confirmColor: 'danger',
                    onConfirm: async () => {
                        setConfirmation(null);
                        const result = await api.importAllData(text);
                        if (result.success) {
                            alert('Data imported successfully. The application will now reload.');
                            window.location.reload();
                        } else {
                            alert(`Import failed: ${result.message}`);
                        }
                    },
                });
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleResetClick = () => {
        setConfirmation({
            title: 'Reset All Data',
            message: 'Are you sure you want to reset all application data to its default state? All projects, custom tasks, and users (except the default admin) will be deleted. This will log you out and cannot be undone.',
            confirmText: 'Reset Application',
            confirmColor: 'danger',
            onConfirm: async () => {
                const result = await api.resetAllData();
                if (result.success) {
                    window.location.reload();
                } else {
                    alert(`Reset failed: ${result.message}`);
                }
            },
        });
    };

    const handleTaskChange = (field, value) => {
        setNewTask(prev => ({ ...prev, [field]: value }));
    };

    const handleLayer2Change = (l2Index, name) => {
        const updatedL2 = [...newTask.subCategories];
        updatedL2[l2Index].name = name;
        setNewTask(prev => ({ ...prev, subCategories: updatedL2 }));
    };

    const handleLayer3Change = (l2Index, l3Index, name) => {
        const updatedL2 = [...newTask.subCategories];
        updatedL2[l2Index].subTasks[l3Index].name = name;
        setNewTask(prev => ({ ...prev, subCategories: updatedL2 }));
    };

    const addLayer2 = () => {
        setNewTask(prev => ({ ...prev, subCategories: [...prev.subCategories, { id: crypto.randomUUID(), name: '', subTasks: [{ id: crypto.randomUUID(), name: '', notes: '', status: SubTaskStatus.PENDING }] }] }));
    };
    
    const addLayer3 = (l2Index) => {
         const updatedL2 = [...newTask.subCategories];
         updatedL2[l2Index].subTasks.push({ id: crypto.randomUUID(), name: '', notes: '', status: SubTaskStatus.PENDING });
         setNewTask(prev => ({ ...prev, subCategories: updatedL2 }));
    };
    
    const toggleCategory = (category: Team) => {
        setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    };
    
    const tiTasks = masterTasks.filter(task => task.category === Team.THREAT_INTEL);
    const rtTasks = masterTasks.filter(task => task.category === Team.RED_TEAM);

    const taskCategories = [
        { title: Team.THREAT_INTEL, tasks: tiTasks },
        { title: Team.RED_TEAM, tasks: rtTasks }
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="space-x-4">
                    <button onClick={() => setShowTaskModal(true)} className="bg-secondary hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg">Create Master Task</button>
                    <button onClick={() => setShowProjectModal(true)} className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">Create New Project</button>
                </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-surface p-6 rounded-lg shadow-lg hover:border-primary border-2 border-transparent transition-all group relative">
                        <div onClick={() => onSelectProject(project)} className="cursor-pointer">
                            <h3 className="text-xl font-bold text-primary">{project.name}</h3>
                            <p className="text-text-secondary mt-2">{project.users.length} members</p>
                            <p className="text-text-secondary">{project.tasks.length} main tasks</p>
                        </div>
                        <button 
                            onClick={() => handleDeleteClick({ type: 'project', id: project.id, name: project.name })}
                            className="absolute top-4 right-4 text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Delete project ${project.name}`}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                 {projects.length === 0 && (
                    <p className="text-text-secondary md:col-span-2 lg:col-span-3 text-center py-8">No projects created yet.</p>
                )}
            </div>
            
            <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div>
                    <h2 className="text-2xl font-semibold mb-4">Master Task Library</h2>
                    <div className="space-y-4">
                        {taskCategories.map(({ title, tasks }) => (
                            <div key={title} className="bg-surface rounded-lg shadow-lg">
                                <div 
                                    className="p-4 flex justify-between items-center cursor-pointer"
                                    onClick={() => toggleCategory(title)}
                                >
                                    <h3 className="text-xl font-semibold text-text-primary">{title}</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm px-2 py-1 rounded-full bg-gray-700 text-text-secondary">{tasks.length} tasks</span>
                                        <ChevronDownIcon className={`w-6 h-6 transform transition-transform text-text-secondary ${expandedCategories[title] ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                {expandedCategories[title] && (
                                    <div className="border-t border-gray-700">
                                        {tasks.length > 0 ? (
                                            <ul className="divide-y divide-gray-700">
                                                {tasks.map(task => (
                                                    <li key={task.id} className="p-4 flex justify-between items-center group">
                                                        <p className="font-semibold text-text-primary">{task.name}</p>
                                                        <button
                                                            onClick={() => handleDeleteClick({ type: 'task', id: task.id, name: task.name })}
                                                            className="text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                                            aria-label={`Delete task ${task.name}`}
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="p-4 text-center text-text-secondary">No master tasks created for this category yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-8">
                     <div>
                         <h2 className="text-2xl font-semibold mb-4">User Management</h2>
                         <div className="bg-surface rounded-lg shadow-lg">
                            <div className="p-4 flex justify-between items-center">
                               <h3 className="text-lg font-semibold text-text-primary">All Users</h3>
                               <button onClick={() => setShowUserModal(true)} className="bg-accent hover:bg-green-500 text-white font-bold py-1 px-3 rounded-md text-sm">Create User</button>
                            </div>
                            <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
                                {allUsers.map(user => (
                                    <li key={user.id} className="p-4 flex justify-between items-center group">
                                        <div>
                                            <p className="font-semibold text-text-primary">{user.name}</p>
                                            <p className="text-sm text-text-secondary">{user.email} - <span className="capitalize">{user.role}</span></p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteClick({ type: 'user', id: user.id, name: user.name })}
                                            className="text-gray-500 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                            aria-label={`Delete user ${user.name}`}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                         </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Data Management</h2>
                        <div className="bg-surface rounded-lg shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <DatabaseIcon className="w-6 h-6 mr-3 text-primary" />
                                <h3 className="text-lg font-semibold text-text-primary">Database Controls</h3>
                            </div>
                            <p className="text-sm text-text-secondary mb-6">
                                Export a backup of all data, import from a backup file, or reset the application to its default state.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    <DownloadIcon className="w-5 h-5" /> Export All Data
                                </button>
                                <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    <UploadIcon className="w-5 h-5" /> Import from File
                                </button>
                                <input type="file" ref={importInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                                <button onClick={handleResetClick} className="flex-1 flex items-center justify-center gap-2 bg-danger hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                    <RefreshIcon className="w-5 h-5" /> Reset to Defaults
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showProjectModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-8 w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <h3 className="text-2xl font-bold mb-6">Create New Project</h3>
                        <div className="flex-grow overflow-y-auto pr-4">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Project Name</label>
                            <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 mb-6" />

                            <h4 className="font-semibold mb-4">Add Users</h4>
                            {allUsers.filter(u => u.role === Role.USER).map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-800">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={!!selectedUsers[user.id]}
                                            onChange={e => {
                                                const newSelected = {...selectedUsers};
                                                if(e.target.checked) newSelected[user.id] = Team.THREAT_INTEL;
                                                else delete newSelected[user.id];
                                                setSelectedUsers(newSelected);
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="ml-3 text-sm">{user.name}</span>
                                    </div>
                                    {selectedUsers[user.id] && (
                                        <select 
                                            value={selectedUsers[user.id]}
                                            onChange={e => setSelectedUsers({...selectedUsers, [user.id]: e.target.value as Team})}
                                            className="bg-gray-800 border border-gray-600 rounded-md p-1 text-sm">
                                            <option value={Team.THREAT_INTEL}>{Team.THREAT_INTEL}</option>
                                            <option value={Team.RED_TEAM}>{Team.RED_TEAM}</option>
                                        </select>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setShowProjectModal(false)} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleCreateProject} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Create Project</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-8 w-full max-w-lg">
                        <h3 className="text-2xl font-bold mb-6">Create New User</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" required />
                            <input type="email" placeholder="Email Address" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" required />
                            <input type="password" placeholder="Initial Password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-600" required />
                            <select value={newUserRole} onChange={e => setNewUserRole(e.target.value as Role)} className="w-full bg-gray-800 p-2 rounded border border-gray-600">
                                <option value={Role.USER}>User</option>
                                <option value={Role.ADMIN}>Admin</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setShowUserModal(false)} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleCreateUser} className="bg-accent text-white font-bold py-2 px-4 rounded-lg">Create User</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-text-primary">{confirmation.title}</h3>
                        <div className="text-text-secondary mb-6">
                           {confirmation.message}
                        </div>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setConfirmation(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
                                Cancel
                            </button>
                            <button onClick={confirmation.onConfirm} className={`text-white font-bold py-2 px-4 rounded-lg ${
                                confirmation.confirmColor === 'danger'
                                    ? 'bg-danger hover:bg-red-500'
                                    : 'bg-primary hover:bg-indigo-500'
                            }`}>
                                {confirmation.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
