
import React from 'react';
import PageTitle from '../components/shared/PageTitle';
import TripList from '../components/trips/TripList';
import ItemsToReview from '../components/trips/ItemsToReview';
import { useTheme } from '../contexts/ThemeContext';

const Trips = () => {
  const { t } = useTheme();
  
  return (
    <div>
      <PageTitle 
        title={t('tripDashboard')} 
        subtitle={t('manageTrips')}
      />
      
      <ItemsToReview />
      <TripList />
    </div>
  );
};

export default Trips;
