'use client';

import React from 'react';

interface FormHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onBack?: () => void;
  actionButton?: React.ReactNode;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  onBack,
  actionButton,
}) => {
  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {Icon && <Icon className="h-6 w-6 text-blue-600 mr-3" />}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actionButton}
      </div>
      {onBack && (
        <button
          onClick={onBack}
          className="mt-4 text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← Back
        </button>
      )}
    </div>
  );
};
