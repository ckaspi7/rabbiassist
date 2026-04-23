
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '../ui/dropdown-menu';
import { 
  Home,
  PlaneTakeoff, 
  CalendarCheck, 
  Calendar, 
  MessageSquare, 
  Settings, 
  FileText,
  LogOut, 
  Moon, 
  Sun, 
  Languages 
} from 'lucide-react';

const Header = () => {
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode, language, setLanguage, t } = useTheme();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/trips', icon: PlaneTakeoff, label: t('myTrips') },
    { to: '/reminders', icon: CalendarCheck, label: t('reminders') },
    { to: '/events', icon: Calendar, label: t('eventOrganizer') },
    { to: '/documents', icon: FileText, label: 'Documents' },
    { to: '/assistant', icon: MessageSquare, label: t('assistant') },
    { to: '/settings', icon: Settings, label: t('settings') }
  ];

  return (
    <header className="bg-white dark:bg-black shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            RabbiAssist
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'bg-blue-600 text-white dark:bg-blue-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Navigation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm" className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to} className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={toggleDarkMode}
                className="data-[state=checked]:bg-blue-600"
              />
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </div>

            {/* Language Switch */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900">
                  <Languages className="h-4 w-4" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                <DropdownMenuItem 
                  onClick={() => setLanguage('en')}
                  className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setLanguage('he')}
                  className="text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  עברית
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Button */}
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <LogOut className="h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
