
import React from 'react';
import MenuTile from '../components/shared/MenuTile';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { Calendar, CalendarCheck, MessageSquare, PlaneTakeoff, Settings, FileText } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { t } = useTheme();
  const { data: userProfile } = useUserProfile();
  
  // Get the display name from user profile or default to Rabbi
  const displayName = userProfile?.full_name || t('rabbi');
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-torah-text dark:text-white">
          {t('welcome')}, {displayName}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MenuTile 
          icon={PlaneTakeoff} 
          title={t('myTrips')} 
          to="/trips" 
        />
        <MenuTile 
          icon={CalendarCheck} 
          title={t('reminders')} 
          to="/reminders" 
        />
        <MenuTile 
          icon={Calendar} 
          title={t('eventOrganizer')} 
          to="/events" 
        />
        <MenuTile 
          icon={FileText} 
          title="Documents" 
          to="/documents" 
        />
        <MenuTile 
          icon={MessageSquare} 
          title={t('assistant')} 
          to="/assistant" 
        />
        <MenuTile 
          icon={Settings} 
          title={t('settings')} 
          to="/settings" 
        />
      </div>
    </div>
  );
};

export default Home;
