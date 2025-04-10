import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthProps {
    password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    const strength = zxcvbn(password).score;

    const getPasswordStrengthLabel = () => {
        switch (strength) {
            case 0:
            case 1:
                return 'Low';
            case 2:
                return 'Low';
            case 3:
                return 'Medium';
            case 4:
                return 'High';
            default:
                return 'Low';
        }
    };

    const getPasswordStrengthColor = () => {
        switch (strength) {
            case 0:
            case 1:
                return 'text-red-700';
            case 2:
                return 'text-red-700';
            case 3:
                return 'text-orange-400';
            case 4:
                return 'text-green-700';
            default:
                return 'text-red-700';
        }
    };

    return (
        <h2 className='text-custom'>
            Force: <span className={`font-semibold ${getPasswordStrengthColor()}`}>{getPasswordStrengthLabel()}</span>
        </h2>
    );
};

export default PasswordStrength;