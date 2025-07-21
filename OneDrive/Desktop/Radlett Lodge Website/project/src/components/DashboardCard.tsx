import React from 'react';

interface DashboardCardProps {
  title: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  className = '',
  headerAction 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-soft p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {Icon && (
            <div className="p-2 bg-primary-100 rounded-lg mr-3">
              <Icon size={20} className="text-primary-600" />
            </div>
          )}
          <h3 className="text-lg font-heading font-semibold text-primary-600">
            {title}
          </h3>
        </div>
        {headerAction && (
          <div className="flex-shrink-0">
            {headerAction}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default DashboardCard;