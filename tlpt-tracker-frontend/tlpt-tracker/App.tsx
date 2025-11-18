import React, { useState } from 'react';
import { useServerState } from './hooks/useServerState';
import { useLocalStorage } from './hooks/useLocalStorage';
import authService from './services/authService';
import { Project, User, Role, TaskLayer1 } from './types';
import Login from './components/Login';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import ProjectView from './components/ProjectView';
import ChangePasswordModal from './components/ChangePasswordModal';

function App() {
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('tlpt-currentUser', null);
    const { data: allUsers = [], loading: usersLoading } = useServerState('users', []);
    const { data: projects = [], loading: projectsLoading } = useServerState('projects', []);
    const { data: masterTasks = [], loading: tasksLoading } = useServerState('tasks', []);
    
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showChangePassword, setShowChangePassword] = useState(false);

    const handleLogin = async (email: string, password: string): Promise<User | null> => {
        console.log('🔍 App handleLogin called with:', { email, password });
        try {
            const response = await authService.login(email, password);
            
            console.log('🔍 App received response:', response);
            
            if (response.success) {
                const user: User = {
                    id: response.user.id,
                    name: response.user.username,
                    email: response.user.email,
                    role: response.user.role as Role,
                    team: response.user.team,
                    password: ''
                };
                
                setCurrentUser(user);
                return user;
            } else {
                alert(response.message || 'Login failed');
                return null;
            }
        } catch (error) {
            console.error('🔍 App login error:', error);
            alert('Login failed. Please try again.');
            return null;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        setSelectedProject(null);
    };
    
    const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
        if (!currentUser) {
            return false;
        }
        
        try {
            const response = await authService.changePassword(currentPassword, newPassword);
            
            if (response.success) {
                alert('Password changed successfully!');
                return true;
            } else {
                alert(response.message || 'Failed to change password');
                return false;
            }
        } catch (error) {
            console.error('Password change error:', error);
            alert(error.message || 'Failed to change password. Please try again.');
            return false;
        }
    };

    const handleSelectProject = (project: Project) => {
        setSelectedProject(project);
    };

    const handleUpdateProject = (updatedProject: Project) => {
        setSelectedProject(updatedProject);
    };
    
    const isLoading = projectsLoading || tasksLoading || usersLoading;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-text-primary text-xl">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Application...
            </div>
        );
    }

    if (!currentUser) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="bg-surface shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary">TLPT Tracker</h1>
                <div>
                    <span className="text-text-secondary mr-4">Welcome, {currentUser.name}</span>
                    <button 
                        onClick={() => setShowChangePassword(true)} 
                        className="text-sm bg-secondary hover:bg-purple-500 text-white font-semibold py-2 px-3 rounded-lg mr-2"
                    >
                        Change Password
                    </button>
                    <button 
                        onClick={handleLogout} 
                        className="text-sm bg-danger hover:bg-red-500 text-white font-semibold py-2 px-3 rounded-lg"
                    >
                        Logout
                    </button>
                </div>
            </header>
            <main>
                {selectedProject ? (
                    <ProjectView 
                        project={selectedProject} 
                        currentUser={currentUser}
                        allMasterTasks={masterTasks}
                        onUpdateProject={handleUpdateProject}
                        onBack={() => setSelectedProject(null)}
                    />
                ) : (
                    <>
                        {currentUser.role === Role.ADMIN && (
                            <AdminView 
                                projects={projects} 
                                allUsers={allUsers}
                                masterTasks={masterTasks}
                                onSelectProject={handleSelectProject} 
                            />
                        )}
                        {currentUser.role === Role.USER && (
                            <UserView 
                                projects={projects} 
                                currentUser={currentUser}
                                onSelectProject={handleSelectProject} 
                            />
                        )}
                    </>
                )}
            </main>
            {showChangePassword && (
                <ChangePasswordModal 
                    onClose={() => setShowChangePassword(false)}
                    onChangePassword={handleChangePassword}
                />
            )}
        </div>
    );
}

export default App;
