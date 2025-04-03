import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-custom-dark-gray rounded-lg">
      {(label || description) && (
        <div>
          {label && <h3 className="text-custom font-medium">{label}</h3>}
          {description && <p className="text-custom-light-gray text-sm">{description}</p>}
        </div>
      )}
      <div 
        onClick={handleToggle}
        className={`relative inline-block w-14 h-7 rounded-full cursor-pointer transition-colors ${
          disabled 
            ? 'bg-custom-gray opacity-50' 
            : checked 
              ? 'bg-custom-blue' 
              : 'bg-custom-gray'
        }`}
      >
        <span 
          className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform ${
            checked ? 'transform translate-x-7' : ''
          }`}
        />
      </div>
    </div>
  );
};

export default ToggleSwitch; 