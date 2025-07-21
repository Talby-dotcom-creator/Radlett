import React from 'react';
import { Zap, UserCheck, Users, Calendar, Clock, Edit, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardCard from '../DashboardCard';
import Button from '../Button';

interface QuickActionsCardProps {
  isAdmin: boolean;
  onSelectMinutes: () => void;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ isAdmin, onSelectMinutes }) => {
  const navigate = useNavigate();

  return (
    <DashboardCard title="Quick Actions" icon={Zap}>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          variant="secondary" 
          fullWidth 
          size="sm" 
          className="flex items-center justify-start" 
          onClick={() => navigate('/members/profile')}
        >
          <UserCheck size={14} className="mr-2" />
          Update Profile
        </Button>
        
        <Button 
          variant="secondary" 
          fullWidth 
          size="sm" 
          className="flex items-center justify-start" 
          onClick={() => navigate('/members/directory')}
        >
          <Users size={14} className="mr-2" />
          Member Directory
        </Button>
        
        <Button 
          variant="secondary" 
          fullWidth 
          size="sm" 
          className="flex items-center justify-start" 
          onClick={() => navigate('/events')}
        >
          <Calendar size={14} className="mr-2" />
          Lodge Calendar
        </Button>
        
        <Button 
          variant="secondary" 
          fullWidth 
          size="sm" 
          className="flex items-center justify-start" 
          onClick={onSelectMinutes}
        >
          <Clock size={14} className="mr-2" />
          Meeting Minutes
        </Button>
        
        {isAdmin && (
          <>
            <div className="border-t border-neutral-200 my-2"></div>
            <Button 
              variant="primary" 
              fullWidth 
              size="sm" 
              className="flex items-center justify-start" 
              onClick={() => navigate('/members/cms')}
            >
              <Edit size={14} className="mr-2" />
              Content Management
            </Button>
            
            <Button 
              variant="outline" 
              fullWidth 
              size="sm" 
              className="flex items-center justify-start" 
              onClick={() => navigate('/members/admin')}
            >
              <Settings size={14} className="mr-2" />
              Admin Dashboard
            </Button>
          </>
        )}
      </div>
    </DashboardCard>
  );
};

export default QuickActionsCard;