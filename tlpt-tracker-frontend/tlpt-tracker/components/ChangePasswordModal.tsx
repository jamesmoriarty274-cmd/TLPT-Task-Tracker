import React, { useState } from 'react';

interface ChangePasswordModalProps {
    onClose: () => void;
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onChangePassword }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, text: '', color: 'bg-gray-500' };
        if (password.length < 8) return { strength: 1, text: 'Weak', color: 'bg-red-500' };
        
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const strength = [hasUpper, hasLower, hasNumbers, hasSpecial].filter(Boolean).length;
        
        const strengths = [
            { strength: 1, text: 'Weak', color: 'bg-red-500' },
            { strength: 2, text: 'Fair', color: 'bg-orange-500' },
            { strength: 3, text: 'Good', color: 'bg-yellow-500' },
            { strength: 4, text: 'Strong', color: 'bg-green-500' },
            { strength: 5, text: 'Very Strong', color: 'bg-green-600' }
        ];
        
        return strengths[strength] || strengths[0];
    };

    const passwordStrength = getPasswordStrength(newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All fields are required.');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('New password must be at least 8 characters long.');
            setIsLoading(false);
            return;
        }

        if (newPassword === currentPassword) {
            setError('New password must be different from current password.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await onChangePassword(currentPassword, newPassword);
            if (result) {
                setSuccess('Password changed successfully!');
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError('Failed to change password. Please check your current password and try again.');
            }
        } catch (err) {
            setError('An error occurred while changing password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const PasswordInput = ({ value, onChange, placeholder, showPassword, setShowPassword, disabled }) => (
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="w-full bg-gray-800 p-2 rounded border border-gray-600 focus:border-primary focus:outline-none transition-colors pr-10"
                required
                disabled={disabled}
                autoComplete="new-password"
            />
            <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                onClick={() => setShowPassword(!showPassword)}
                disabled={disabled}
            >
                {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.41 3.41" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                )}
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-8 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-primary">Change Password</h3>
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
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Current Password
                        </label>
                        <PasswordInput
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            showPassword={showCurrentPassword}
                            setShowPassword={setShowCurrentPassword}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            New Password
                        </label>
                        <PasswordInput
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            showPassword={showNewPassword}
                            setShowPassword={setShowNewPassword}
                            disabled={isLoading}
                        />
                        
                        {newPassword && (
                            <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-text-secondary">Password strength:</span>
                                    <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                                        {passwordStrength.text}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 text-xs text-text-secondary">
                                    {newPassword.length < 8 && 'Must be at least 8 characters'}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Confirm New Password
                        </label>
                        <PasswordInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            showPassword={showConfirmPassword}
                            setShowPassword={setShowConfirmPassword}
                            disabled={isLoading}
                        />
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                        )}
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
                            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
                            className="bg-primary hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Changing...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
