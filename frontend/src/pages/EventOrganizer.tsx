import React, { useState } from 'react';
import PageTitle from '../components/shared/PageTitle';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CalendarIcon, LinkIcon, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const EventOrganizer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    
    // This would normally integrate with Google Calendar API
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast({
        title: 'Google Calendar Connected',
        description: 'Your calendar is now synced with reminders.',
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <PageTitle 
        title="Event Organizer" 
        subtitle="Connect your Google Calendar to sync reminders and events"
      />
      
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Google Calendar Integration</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Sync your reminders and create calendar events automatically
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isConnected ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Features you'll get:</h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Automatic sync of reminders to Google Calendar
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Smart event creation with due dates and alerts
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Two-way synchronization between platforms
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Trip events automatically added to calendar
                    </li>
                  </ul>
                </div>
                
                <Button 
                  onClick={handleConnectGoogle}
                  disabled={isConnecting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  {isConnecting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5 mr-2" />
                      Connect Google Calendar
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
                  Calendar Connected!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your reminders will now sync with Google Calendar automatically.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" className="rounded-xl">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConnected(false)}
                    className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventOrganizer;