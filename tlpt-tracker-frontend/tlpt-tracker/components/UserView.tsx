
import React from 'react';
import { Project, User } from '../types';

interface UserViewProps {
    projects: Project[];
    currentUser: User;
    onSelectProject: (project: Project) => void;
}

const UserView: React.FC<UserViewProps> = ({ projects, currentUser, onSelectProject }) => {
    
    const userProjects = projects.filter(p => p.users.some(u => u.id === currentUser.id));

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6">Your Projects</h1>
            {userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProjects.map(project => {
                        const userInProject = project.users.find(u => u.id === currentUser.id);
                        return (
                             <div key={project.id} onClick={() => onSelectProject(project)} className="bg-surface p-6 rounded-lg shadow-lg hover:shadow-primary/50 hover:border-primary border-2 border-transparent transition-all cursor-pointer">
                                <h3 className="text-xl font-bold text-primary">{project.name}</h3>
                                <p className="text-text-secondary mt-2">Your Role: {userInProject?.team}</p>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-text-secondary text-center py-10">You have not been assigned to any projects yet.</p>
            )}
        </div>
    );
};

export default UserView;
