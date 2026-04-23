
import React from 'react';
import MenuTile from '../components/shared/MenuTile';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { Calendar, CalendarCheck, MessageSquare, PlaneTakeoff, Settings, FileText } from 'lucide-react';

const Home = () => {
  const { t } = useTheme();
  const { data: userProfile } = useUserProfile();

  const displayName = userProfile?.full_name || t('rabbi');

  const tiles = [
    {
      icon: PlaneTakeoff,
      title: t('myTrips'),
      description: 'Track flights, hotels, and documents',
      to: '/trips',
    },
    {
      icon: CalendarCheck,
      title: t('reminders'),
      description: 'Tasks and reminders from Notes & trips',
      to: '/reminders',
    },
    {
      icon: Calendar,
      title: t('eventOrganizer'),
      description: 'Sync with Google Calendar',
      to: '/events',
    },
    {
      icon: FileText,
      title: 'Documents',
      description: 'Receipts, trip files, WhatsApp exports',
      to: '/documents',
    },
    {
      icon: MessageSquare,
      title: t('assistant'),
      description: 'AI-powered assistant',
      to: '/assistant',
    },
    {
      icon: Settings,
      title: t('settings'),
      description: 'Account and notifications',
      to: '/settings',
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
          Dashboard
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
          {t('welcome')}, {displayName}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">
          What would you like to manage today?
        </p>
      </div>

      {/* Bento grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'auto auto auto',
        }}
      >
        {/* Row 1: Trips (2/3) + Reminders (1/3) */}
        <div
          className="stagger-item"
          style={{ gridColumn: 'span 2', animationDelay: '0ms', minHeight: '180px' }}
        >
          <MenuTile
            icon={PlaneTakeoff}
            title={tiles[0].title}
            description={tiles[0].description}
            to={tiles[0].to}
            style={{ height: '100%' }}
          />
        </div>
        <div
          className="stagger-item"
          style={{ gridColumn: 'span 1', animationDelay: '60ms', minHeight: '180px' }}
        >
          <MenuTile
            icon={CalendarCheck}
            title={tiles[1].title}
            description={tiles[1].description}
            to={tiles[1].to}
            style={{ height: '100%' }}
          />
        </div>

        {/* Row 2: Events + Documents + Assistant (equal thirds) */}
        {tiles.slice(2, 5).map((tile, i) => (
          <div
            key={tile.to}
            className="stagger-item"
            style={{ gridColumn: 'span 1', animationDelay: `${(i + 2) * 60}ms`, minHeight: '160px' }}
          >
            <MenuTile
              icon={tile.icon}
              title={tile.title}
              description={tile.description}
              to={tile.to}
              style={{ height: '100%' }}
            />
          </div>
        ))}

        {/* Row 3: Settings — full width, compact */}
        <div
          className="stagger-item"
          style={{ gridColumn: 'span 3', animationDelay: '300ms' }}
        >
          <MenuTile
            icon={Settings}
            title={tiles[5].title}
            description={tiles[5].description}
            to={tiles[5].to}
          />
        </div>
      </div>

      {/* Mobile: single column override */}
      <style>{`
        @media (max-width: 767px) {
          .bento-grid > * { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
