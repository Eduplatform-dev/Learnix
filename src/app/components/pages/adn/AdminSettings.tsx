import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Textarea } from "../../ui/textarea";
import { Separator } from "../../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Settings, Bell, Lock, Globe, Mail, Database } from "lucide-react";

export function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [general, setGeneral] = useState({
    platformName: "EduPlatform",
    supportEmail: "support@eduplatform.com",
    logoUrl: "",
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    productUpdates: false,
    billingAlerts: true,
  });

  const [security, setSecurity] = useState({
    enforceTwoFactor: false,
    allowGoogleLogin: true,
    sessionTimeout: "30",
  });

  const [localization, setLocalization] = useState({
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
  });

  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    fromName: "EduPlatform",
    fromEmail: "no-reply@eduplatform.com",
    footer: "Thanks for learning with us.",
  });

  const [backup, setBackup] = useState({
    autoBackup: true,
    retentionDays: "30",
    backupWindow: "02:00-04:00",
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setLastSaved(new Date().toLocaleString());
    }, 600);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <p className="text-xs text-gray-500">Last saved: {lastSaved}</p>
          )}
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={general.platformName}
              onChange={(e) => setGeneral({ ...general, platformName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={general.supportEmail}
              onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              placeholder="https://..."
              value={general.logoUrl}
              onChange={(e) => setGeneral({ ...general, logoUrl: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Updates</p>
              <p className="text-sm text-gray-500">Send weekly activity summaries</p>
            </div>
            <Switch
              checked={notifications.emailUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailUpdates: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Product Updates</p>
              <p className="text-sm text-gray-500">Notify users about new features</p>
            </div>
            <Switch
              checked={notifications.productUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, productUpdates: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Billing Alerts</p>
              <p className="text-sm text-gray-500">Send receipts and payment reminders</p>
            </div>
            <Switch
              checked={notifications.billingAlerts}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, billingAlerts: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enforce Two-Factor</p>
              <p className="text-sm text-gray-500">Require 2FA for admins</p>
            </div>
            <Switch
              checked={security.enforceTwoFactor}
              onCheckedChange={(checked) =>
                setSecurity({ ...security, enforceTwoFactor: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Allow Google Login</p>
              <p className="text-sm text-gray-500">Enable OAuth sign-in</p>
            </div>
            <Switch
              checked={security.allowGoogleLogin}
              onCheckedChange={(checked) =>
                setSecurity({ ...security, allowGoogleLogin: checked })
              }
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Session Timeout</Label>
            <Select
              value={security.sessionTimeout}
              onValueChange={(value) => setSecurity({ ...security, sessionTimeout: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />
            Localization
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={localization.language}
              onValueChange={(value) => setLocalization({ ...localization, language: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={localization.timezone}
              onValueChange={(value) => setLocalization({ ...localization, timezone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date Format</Label>
            <Select
              value={localization.dateFormat}
              onValueChange={(value) => setLocalization({ ...localization, dateFormat: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Configuration */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-600" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input
              id="smtpHost"
              value={emailConfig.smtpHost}
              onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input
              id="smtpPort"
              value={emailConfig.smtpPort}
              onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtpUser">SMTP Username</Label>
            <Input
              id="smtpUser"
              value={emailConfig.smtpUser}
              onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromName">From Name</Label>
            <Input
              id="fromName"
              value={emailConfig.fromName}
              onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fromEmail">From Email</Label>
            <Input
              id="fromEmail"
              type="email"
              value={emailConfig.fromEmail}
              onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="footer">Email Footer</Label>
            <Textarea
              id="footer"
              rows={3}
              value={emailConfig.footer}
              onChange={(e) => setEmailConfig({ ...emailConfig, footer: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Database and Backup */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Database and Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between md:col-span-3">
            <div>
              <p className="font-medium text-gray-900">Automatic Backups</p>
              <p className="text-sm text-gray-500">Run scheduled backups</p>
            </div>
            <Switch
              checked={backup.autoBackup}
              onCheckedChange={(checked) => setBackup({ ...backup, autoBackup: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label>Retention</Label>
            <Select
              value={backup.retentionDays}
              onValueChange={(value) => setBackup({ ...backup, retentionDays: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Backup Window</Label>
            <Select
              value={backup.backupWindow}
              onValueChange={(value) => setBackup({ ...backup, backupWindow: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select window" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00:00-02:00">00:00-02:00</SelectItem>
                <SelectItem value="02:00-04:00">02:00-04:00</SelectItem>
                <SelectItem value="04:00-06:00">04:00-06:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
