import React from 'react';

const Card = ({
  children, 
  title,
  subtitle,
  className = '',
  padding = 'p-6',
  shadow = 'shadow-md',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200';
  const classes = `${baseClasses} ${shadow} ${padding} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
      {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
      )}
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card; 