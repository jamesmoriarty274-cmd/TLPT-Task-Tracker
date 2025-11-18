import React, { useState } from 'react';

interface ProjectModalProps {
  onClose: () => void;
  onCreateProject: (projectData: { name: string; description: string }) => Promise<boolean>;
  category: string;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onCreateProject, category }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    if (name.trim().length < 3) {
      setError('Project name must be at least 3 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await onCreateProject({
        name: name.trim(),
        description: description.trim()
      });

      if (result) {
        setSuccess('Project created successfully!');
        setName('');
        setDescription('');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError('Failed to create project. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while creating the project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const categories: { [key: string]: string } = {
      threat_intel: 'Threat Intelligence',
      red_team: 'Red Team'
    };
    return categories[categoryId] || categoryId;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-8 w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-text-primary">Create New Project</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-200 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-800 rounded">
          <p className="text-sm text-text-secondary">
            Category: <span className="font-semibold text-text-primary">{getCategoryName(category)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Project Name *
            </label>
            <input
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded border border-gray-600 focus:border-primary focus:outline-none transition-colors"
              required
              disabled={isLoading}
              maxLength={100}
            />
            <div className="text-xs text-text-secondary mt-1 text-right">
              {name.length}/100
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter project description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-gray-800 p-2 rounded border border-gray-600 focus:border-primary focus:outline-none transition-colors resize-none"
              disabled={isLoading}
              maxLength={500}
            />
            <div className="text-xs text-text-secondary mt-1 text-right">
              {description.length}/500
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded">
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || name.trim().length < 3}
              className="bg-primary hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
