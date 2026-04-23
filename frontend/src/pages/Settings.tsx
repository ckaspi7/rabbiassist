
import React, { useState } from 'react';
import PageTitle from '../components/shared/PageTitle';
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
    <div className="max-w-2xl mx-auto">
      <PageTitle title="Settings" />

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-100 dark:divide-zinc-800 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
        {/* Account */}
        <div className="px-6 py-5">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">Account</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Email</label>
              <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300">{user?.email}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">User ID</label>
              <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-zinc-400 dark:text-zinc-500 font-mono">{user?.id?.substring(0, 8)}…</div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="px-6 py-5">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">Security</p>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Two-Factor Authentication</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Add an extra layer of security</p>
              </div>
              <Switch
                checked={notificationSettings.twoFactor}
                onCheckedChange={() => handleSwitchChange('twoFactor')}
              />
            </div>

            {!isChangingPassword ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </Button>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Change Password</p>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Current Password</label>
                  <Input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">New Password</label>
                  <Input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700" required minLength={12} placeholder="Min 12 chars, uppercase, lowercase, number, symbol" />
                  <p className="text-xs text-zinc-400 mt-1">Must contain: uppercase, lowercase, number, and special character</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Confirm Password</label>
                  <Input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700" required minLength={6} />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={cancelPasswordChange}>Cancel</Button>
                  <Button type="submit" size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    {isLoading ? 'Updating…' : 'Update Password'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="px-6 py-5">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-4">Notifications</p>
          <div className="space-y-5">
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'whatsapp', label: 'WhatsApp Notifications', desc: 'Receive notifications via WhatsApp' },
              { key: 'tripReminders', label: 'Trip Reminders', desc: 'Receive reminders before upcoming trips' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{desc}</p>
                </div>
                <Switch
                  checked={notificationSettings[key as keyof typeof notificationSettings]}
                  onCheckedChange={() => handleSwitchChange(key)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" size="sm" className="rounded-xl border-zinc-200 dark:border-zinc-700">Cancel</Button>
        <Button size="sm" onClick={handleSave} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
