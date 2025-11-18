import React, { useState } from 'react';
import { SubTask, SubTaskStatus, Role, User } from '../types';
import { PlayIcon, StopIcon, BanIcon, CheckCircleIcon, EditIcon, ClockIcon } from './icons';

interface SubTaskItemProps {
    task: SubTask;
    updateTask: (updatedTask: SubTask) => void;
    currentUser: User;
    isAssigned: boolean;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({ task, updateTask, currentUser, isAssigned }) => {
    const [notes, setNotes] = useState(task.notes);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [editedStartTime, setEditedStartTime] = useState('');
    const [editedStopTime, setEditedStopTime] = useState('');

    const handleTimer = () => {
        if (task.status === SubTaskStatus.IN_PROGRESS) {
            updateTask({ ...task, stopTime: Date.now(), status: SubTaskStatus.COMPLETED });
        } else {
            updateTask({ ...task, startTime: Date.now(), stopTime: undefined, status: SubTaskStatus.IN_PROGRESS });
        }
    };

    const handleNotApplicable = () => {
        const newStatus = task.status === SubTaskStatus.NOT_APPLICABLE ? SubTaskStatus.PENDING : SubTaskStatus.NOT_APPLICABLE;
        updateTask({ ...task, status: newStatus, startTime: undefined, stopTime: undefined });
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
    };

    const handleSaveNotes = () => {
        if (notes !== task.notes) {
            updateTask({ ...task, notes });
        }
        setIsEditingNotes(false);
    };
    
    const handleEditNotes = () => {
        setNotes(task.notes); // Sync with latest props before editing
        setIsEditingNotes(true);
    };
    
    const formatTime = (timestamp?: number) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    };

    const renderMarkdown = (text: string) => {
        if (!text) return { __html: '<p class="text-gray-500">No notes yet.</p>' };
        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
            
        html = html
            .replace(/\`{3}([\s\S]*?)\`{3}/g, '<pre class="bg-gray-900 p-2 my-1 rounded text-sm text-yellow-300 overflow-x-auto"><code>$1</code></pre>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-700 text-yellow-300 px-1 rounded-sm">$1</code>')
            .replace(/\n/g, '<br />');
            
        return { __html: html };
    };

    // Time Editing Logic
    const formatTimestampForInput = (timestamp?: number): string => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const handleEditTime = () => {
        setEditedStartTime(formatTimestampForInput(task.startTime));
        setEditedStopTime(formatTimestampForInput(task.stopTime));
        setIsEditingTime(true);
    };

    const handleSaveTime = () => {
        const newStartTime = editedStartTime ? new Date(editedStartTime).getTime() : undefined;
        const newStopTime = editedStopTime ? new Date(editedStopTime).getTime() : undefined;

        if (newStartTime && newStopTime && newStopTime < newStartTime) {
            alert("Stop time cannot be earlier than start time.");
            return;
        }

        updateTask({ ...task, startTime: newStartTime, stopTime: newStopTime });
        setIsEditingTime(false);
    };


    const canInteractControls = currentUser.role === Role.ADMIN || isAssigned;
    const canEditNotes = currentUser.role === Role.ADMIN || isAssigned;

    const getStatusChip = () => {
        switch(task.status) {
            case SubTaskStatus.COMPLETED:
                return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-green-900 text-green-300">{task.status}</span>
            case SubTaskStatus.IN_PROGRESS:
                return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-blue-900 text-blue-300">{task.status}</span>
            case SubTaskStatus.NOT_APPLICABLE:
                 return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-gray-700 text-gray-300">{task.status}</span>
            case SubTaskStatus.PENDING:
            default:
                return <span className="text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-yellow-900 text-yellow-300">{task.status}</span>
        }
    };

    return (
        <div className="pl-4 py-3 border-l-2 border-gray-700 ml-4">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                    {task.status === SubTaskStatus.COMPLETED && <CheckCircleIcon className="w-5 h-5 text-accent mr-2" />}
                    {task.status === SubTaskStatus.NOT_APPLICABLE && <BanIcon className="w-5 h-5 text-text-secondary mr-2" />}
                    <p className="text-text-primary">{task.name}</p>
                </div>
                {getStatusChip()}
            </div>
            <div className="flex items-center gap-2 mb-3">
                 <button 
                    onClick={handleTimer}
                    disabled={!canInteractControls || task.status === SubTaskStatus.COMPLETED || task.status === SubTaskStatus.NOT_APPLICABLE}
                    className={`flex items-center px-3 py-1 text-sm rounded ${
                        task.status === SubTaskStatus.IN_PROGRESS 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors`}
                >
                    {task.status === SubTaskStatus.IN_PROGRESS ? <StopIcon className="w-4 h-4 mr-1" /> : <PlayIcon className="w-4 h-4 mr-1" />}
                    {task.status === SubTaskStatus.IN_PROGRESS ? 'Stop' : 'Start'}
                </button>
                 <button 
                    onClick={handleNotApplicable}
                    disabled={!canInteractControls || task.status === SubTaskStatus.COMPLETED}
                    className="flex items-center px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    <BanIcon className="w-4 h-4 mr-1"/>
                    N/A
                </button>
                {currentUser.role === Role.ADMIN && (
                    <button
                        onClick={handleEditTime}
                        className="flex items-center px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors"
                        title="Manually edit start/stop times"
                    >
                        <ClockIcon className="w-4 h-4 mr-1"/>
                        Edit Time
                    </button>
                )}
            </div>
             <div className="text-xs text-text-secondary space-y-1 mb-3">
                <p>Start: {formatTime(task.startTime)}</p>
                <p>Stop: {formatTime(task.stopTime)}</p>
            </div>
            
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-text-secondary">Notes</label>
                     {canEditNotes && (
                        !isEditingNotes ? (
                             <button onClick={handleEditNotes} className="flex items-center px-3 py-1 text-sm rounded bg-gray-600 hover:bg-gray-700 text-white transition-colors">
                                <EditIcon className="w-4 h-4 mr-1"/> Edit Notes
                            </button>
                        ) : (
                             <button onClick={handleSaveNotes} className="flex items-center px-3 py-1 text-sm rounded bg-primary hover:bg-indigo-500 text-white transition-colors">
                                Save Notes
                            </button>
                        )
                    )}
                </div>
                {isEditingNotes ? (
                    <textarea
                        value={notes}
                        onChange={handleNotesChange}
                        placeholder="Add notes, commands, etc. (Markdown supported)"
                        className="w-full h-40 p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-primary focus:border-primary text-sm text-text-secondary"
                        autoFocus
                    />
                ) : (
                    <div 
                        className="prose prose-sm prose-invert max-w-none min-h-[10rem] w-full p-3 bg-gray-800/50 border border-transparent rounded-md text-sm text-text-secondary whitespace-pre-wrap"
                        dangerouslySetInnerHTML={renderMarkdown(task.notes)}
                    />
                )}
            </div>

            {isEditingTime && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-lg p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 text-text-primary">Edit Timestamps for "{task.name}"</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Start Time</label>
                                <input
                                    type="datetime-local"
                                    value={editedStartTime}
                                    onChange={(e) => setEditedStartTime(e.target.value)}
                                    className="w-full bg-gray-800 p-2 rounded border border-gray-600 text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Stop Time</label>
                                <input
                                    type="datetime-local"
                                    value={editedStopTime}
                                    onChange={(e) => setEditedStopTime(e.target.value)}
                                    className="w-full bg-gray-800 p-2 rounded border border-gray-600 text-text-primary"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setIsEditingTime(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleSaveTime} className="bg-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubTaskItem;