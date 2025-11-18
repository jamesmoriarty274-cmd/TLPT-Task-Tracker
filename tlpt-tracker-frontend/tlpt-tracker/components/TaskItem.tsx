import React, { useState } from 'react';
import { TaskLayer1, TaskLayer2, SubTask, User } from '../types';
import { ChevronDownIcon } from './icons';
import SubTaskItem from './SubTaskItem';

interface TaskItemProps {
    task: TaskLayer1;
    updateMainTask: (updatedTask: TaskLayer1) => void;
    projectUsers: User[];
    currentUser: User;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, updateMainTask, projectUsers, currentUser }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedL2, setExpandedL2] = useState<Record<string, boolean>>({});

    const updateSubTask = (l2Id: string, updatedSubTask: SubTask) => {
        const updatedTask = { ...task };
        const l2Index = updatedTask.subCategories.findIndex(l2 => l2.id === l2Id);
        if (l2Index > -1) {
            const l3Index = updatedTask.subCategories[l2Index].subTasks.findIndex(l3 => l3.id === updatedSubTask.id);
            if (l3Index > -1) {
                updatedTask.subCategories[l2Index].subTasks[l3Index] = updatedSubTask;
                updateMainTask(updatedTask);
            }
        }
    };
    
    const toggleL2 = (id: string) => {
        setExpandedL2(prev => ({...prev, [id]: !prev[id]}));
    }

    const assignedUserNames = task.assignedUsers.map(userId => projectUsers.find(u => u.id === userId)?.name).filter(Boolean).join(', ');
    const isCurrentUserAssigned = task.assignedUsers.includes(currentUser.id);

    return (
        <div className="bg-surface rounded-lg mb-4 shadow-md">
            <div 
                className="p-4 flex justify-between items-center cursor-pointer border-b border-gray-700"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div>
                  <h3 className="text-xl font-bold text-primary">{task.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">Assigned to: {assignedUserNames || 'Not Assigned'}</p>
                </div>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="p-4">
                    {task.subCategories.map(l2 => (
                        <div key={l2.id} className="mb-3">
                            <div 
                                className="flex items-center cursor-pointer p-2 rounded bg-gray-800 hover:bg-gray-700"
                                onClick={() => toggleL2(l2.id)}
                            >
                                <ChevronDownIcon className={`w-5 h-5 mr-2 transform transition-transform ${expandedL2[l2.id] ? 'rotate-180' : ''}`} />
                                <h4 className="font-semibold text-text-primary">{l2.name}</h4>
                            </div>
                            {expandedL2[l2.id] && (
                                <div className="mt-2 pl-4 border-l border-gray-600">
                                    {l2.subTasks.map(l3 => (
                                        <SubTaskItem 
                                            key={l3.id} 
                                            task={l3}
                                            updateTask={(updatedSubTask) => updateSubTask(l2.id, updatedSubTask)}
                                            currentUser={currentUser}
                                            isAssigned={isCurrentUserAssigned}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskItem;