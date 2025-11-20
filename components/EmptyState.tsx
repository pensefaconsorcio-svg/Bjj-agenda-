import React from 'react';

interface EmptyStateProps {
  icon: React.ReactElement<{ width?: number | string; height?: number | string; }>;
  title: string;
  message: string;
  actionButton?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionButton }) => {
  return (
    <div className="text-center py-16 bg-gray-800 rounded-lg border border-dashed border-gray-700">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-900/50 text-red-500">
        {React.cloneElement(icon, { width: 24, height: 24 })}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-gray-200">{title}</h3>
      <p className="mt-2 max-w-sm mx-auto text-gray-400">{message}</p>
      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;