import React from 'react';

interface DatePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  placeholder = 'Select date',
  className = '',
}) => {
  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-custom-light-gray mb-1">
          {label}
        </label>
      )}
      <input
        type="date"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-md bg-custom border border-custom-gray text-custom-light-gray p-2 ${className}`}
      />
    </div>
  );
};

export default DatePicker; 