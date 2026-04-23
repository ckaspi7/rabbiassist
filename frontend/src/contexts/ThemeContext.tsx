
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  language: 'en' | 'he';
  setLanguage: (lang: 'en' | 'he') => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

const translations = {
  en: {
    welcome: 'Welcome back',
    rabbi: 'Rabbi',
    myTrips: 'My Trips',
    reminders: 'Reminders',
    eventOrganizer: 'Event Organizer',
    assistant: 'Assistant',
    settings: 'Settings',
    receipts: 'Receipts',
    logout: 'Logout',
    tripDashboard: 'Trip Dashboard',
    manageTrips: 'Manage and track your upcoming trips',
    itemsToReview: 'Items to Review',
    documentsToReview: 'Documents to Review',
    noItemsToReview: 'No items to review',
    noDocumentsToReview: 'No documents to review',
    assignToTrip: 'Assign to trip...',
    delete: 'Delete',
    editTrip: 'Edit Trip',
    deleteTrip: 'Delete Trip',
    confirmDelete: 'Are you sure you want to delete',
    cancel: 'Cancel',
    booked: 'Booked',
    pending: 'Pending',
    rescheduled: 'Rescheduled',
    cancelled: 'Cancelled',
    notNeeded: 'Not Needed',
    incomplete: 'Incomplete',
    viewDocument: 'View Document',
    flight: 'Flight',
    hotel: 'Hotel',
    car: 'Car',
    insurance: 'Insurance',
    darkMode: 'Dark Mode',
    language: 'Language'
  },
  he: {
    welcome: 'ברוך הבא',
    rabbi: 'רב',
    myTrips: 'הנסיעות שלי',
    reminders: 'תזכורות',
    eventOrganizer: 'מארגן אירועים',
    assistant: 'עוזר',
    settings: 'הגדרות',
    receipts: 'קבלות',
    logout: 'התנתק',
    tripDashboard: 'לוח בקרת נסיעות',
    manageTrips: 'נהל ועקוב אחר הנסיעות הקרובות שלך',
    itemsToReview: 'פריטים לבדיקה',
    documentsToReview: 'מסמכים לבדיקה',
    noItemsToReview: 'אין פריטים לבדיקה',
    noDocumentsToReview: 'אין מסמכים לבדיקה',
    assignToTrip: 'הקצה לנסיעה...',
    delete: 'מחק',
    editTrip: 'ערוך נסיעה',
    deleteTrip: 'מחק נסיעה',
    confirmDelete: 'האם אתה בטוח שברצונך למחוק',
    cancel: 'ביטול',
    booked: 'הוזמן',
    pending: 'ממתין',
    rescheduled: 'נדחה',
    cancelled: 'בוטל',
    notNeeded: 'לא נדרש',
    incomplete: 'לא הושלם',
    viewDocument: 'צפה במסמך',
    flight: 'טיסה',
    hotel: 'מלון',
    car: 'רכב',
    insurance: 'ביטוח',
    darkMode: 'מצב כהה',
    language: 'שפה'
  }
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'he'>('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const savedLanguage = localStorage.getItem('language') as 'en' | 'he';
    
    if (savedTheme !== null) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};
