
import React, { useState } from 'react';
import PageTitle from '../components/shared/PageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { passwordSchema } from '../lib/validation';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Settings = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    whatsapp: true,
    tripReminders: true,
    twoFactor: false
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSwitchChange = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Validate password using zod schema
      const validatedData = passwordSchema.parse(passwordData);
      
      const { error } = await supabase.auth.updateUser({ 
        password: validatedData.newPassword 
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      });
      
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      // Handle zod validation errors
      if (error.errors) {
        toast({
          title: 'Validation Error',
          description: error.errors[0]?.message || 'Invalid password format',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error updating password',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };
  
  const handleSave = () => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been saved successfully.',
    });
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <PageTitle title="Settings" />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Account Settings</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Manage your account preferences and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-gray-900 dark:text-gray-100">{user?.email}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">User ID</label>
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-gray-900 dark:text-gray-100">{user?.id?.substring(0, 8)}...</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Security</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
              </div>
              <Switch 
                checked={notificationSettings.twoFactor}
                onCheckedChange={() => handleSwitchChange('twoFactor')}
              />
            </div>
            
            {!isChangingPassword ? (
              <div>
                <Button 
                  variant="outline" 
                  className="w-full mt-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">Change Password</h4>
                
                {/* Current Password - note: Supabase doesn't require the current password */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Current Password</label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-black"
                    required
                  />
                </div>
                
                {/* New Password */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">New Password</label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-black"
                    required
                    minLength={12}
                    placeholder="Min 12 chars, uppercase, lowercase, number, symbol"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must contain: uppercase, lowercase, number, and special character
                  </p>
                </div>
                
                {/* Confirm Password */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-black"
                    required
                    minLength={6}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={cancelPasswordChange}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 dark:text-gray-100">Notification Settings</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Configure how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Email Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
              </div>
              <Switch 
                checked={notificationSettings.email}
                onCheckedChange={() => handleSwitchChange('email')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">WhatsApp Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via WhatsApp</p>
              </div>
              <Switch 
                checked={notificationSettings.whatsapp}
                onCheckedChange={() => handleSwitchChange('whatsapp')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Trip Reminders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive reminders before upcoming trips</p>
              </div>
              <Switch 
                checked={notificationSettings.tripReminders}
                onCheckedChange={() => handleSwitchChange('tripReminders')}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
