import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, User, Bell, Shield, Palette, Database, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useSettings } from "@/contexts/SettingsContext";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function SettingsPage() {
  const { isDarkMode, setDarkMode } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { 
    profile, 
    notifications, 
    appearance, 
    updateProfile, 
    updateNotifications, 
    updateAppearance, 
    saveSettings, 
    resetSettings, 
    isDirty 
  } = useSettings();

  const { toast } = useToast();

  const handleSave = () => {
    saveSettings();
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully"
    });
  };

  const handleReset = () => {
    resetSettings();
    setDarkMode(false);
    setCurrency('INR');
    toast({
      title: "Settings reset",
      description: "All settings have been reset to default values"
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and application settings</p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex items-center"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!isDirty}
                  className="flex items-center bg-finance-blue hover:bg-blue-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={profile.fullName}
                    onChange={(e) => updateProfile({ fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={profile.email}
                    onChange={(e) => updateProfile({ email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex space-x-2">
                    <Select value={profile.phoneCode} onValueChange={(value) => updateProfile({ phoneCode: value })}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">🇮🇳 +91</SelectItem>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44</SelectItem>
                        <SelectItem value="+49">🇩🇪 +49</SelectItem>
                        <SelectItem value="+33">🇫🇷 +33</SelectItem>
                        <SelectItem value="+39">🇮🇹 +39</SelectItem>
                        <SelectItem value="+34">🇪🇸 +34</SelectItem>
                        <SelectItem value="+81">🇯🇵 +81</SelectItem>
                        <SelectItem value="+86">🇨🇳 +86</SelectItem>
                        <SelectItem value="+61">🇦🇺 +61</SelectItem>
                        <SelectItem value="+971">🇦🇪 +971</SelectItem>
                        <SelectItem value="+65">🇸🇬 +65</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      id="phone" 
                      placeholder="98765 43210" 
                      className="flex-1"
                      value={profile.phone}
                      onChange={(e) => updateProfile({ phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={profile.timezone} onValueChange={(value) => updateProfile({ timezone: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IST">🇮🇳 IST - India Standard Time</SelectItem>
                      <SelectItem value="EST">🇺🇸 EST - Eastern Time</SelectItem>
                      <SelectItem value="PST">🇺🇸 PST - Pacific Time</SelectItem>
                      <SelectItem value="CST">🇺🇸 CST - Central Time</SelectItem>
                      <SelectItem value="MST">🇺🇸 MST - Mountain Time</SelectItem>
                      <SelectItem value="GMT">🇬🇧 GMT - Greenwich Mean Time</SelectItem>
                      <SelectItem value="CET">🇪🇺 CET - Central European Time</SelectItem>
                      <SelectItem value="JST">🇯🇵 JST - Japan Standard Time</SelectItem>
                      <SelectItem value="CST_CN">🇨🇳 CST - China Standard Time</SelectItem>
                      <SelectItem value="AEST">🇦🇺 AEST - Australian Eastern Time</SelectItem>
                      <SelectItem value="GST">🇦🇪 GST - Gulf Standard Time</SelectItem>
                      <SelectItem value="SGT">🇸🇬 SGT - Singapore Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications about transactions and bills</p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications.notifications}
                    onCheckedChange={(checked) => updateNotifications({ notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-reports">Email Reports</Label>
                    <p className="text-sm text-muted-foreground">Weekly financial summary via email</p>
                  </div>
                  <Switch
                    id="email-reports"
                    checked={notifications.emailReports}
                    onCheckedChange={(checked) => updateNotifications({ emailReports: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync">Auto Sync</Label>
                    <p className="text-sm text-muted-foreground">Automatically sync data across devices</p>
                  </div>
                  <Switch
                    id="auto-sync"
                    checked={notifications.autoSync}
                    onCheckedChange={(checked) => updateNotifications({ autoSync: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">🇮🇳 INR - Indian Rupee</SelectItem>
                      <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                      <SelectItem value="GBP">🇬🇧 GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="AUD">🇦🇺 AUD - Australian Dollar</SelectItem>
                      <SelectItem value="JPY">🇯🇵 JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CNY">🇨🇳 CNY - Chinese Yuan</SelectItem>
                      <SelectItem value="CHF">🇨🇭 CHF - Swiss Franc</SelectItem>
                      <SelectItem value="SGD">🇸🇬 SGD - Singapore Dollar</SelectItem>
                      <SelectItem value="AED">🇦🇪 AED - UAE Dirham</SelectItem>
                      <SelectItem value="KRW">🇰🇷 KRW - South Korean Won</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={appearance.language} onValueChange={(value) => updateAppearance({ language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="data-retention">Data Retention</Label>
                  <Select value={appearance.dataRetention} onValueChange={(value) => updateAppearance({ dataRetention: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    Enable Two-Factor Auth
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline">
                    Export Data
                  </Button>
                  <Button variant="outline">
                    Import Backup
                  </Button>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Deleting your account will permanently remove all your data and cannot be undone.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <Button onClick={handleSave} className="bg-finance-blue hover:bg-blue-700">
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}