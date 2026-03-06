import { useState, useEffect } from "react";
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

import {
  Settings,
  Bell,
  Lock,
  Globe,
  Mail,
  Database,
} from "lucide-react";

/* ✅ NEW SERVICE IMPORT */
import {
  getSettings,
  saveSettings,
} from "../../../services/adminService";

export function AdminSettings() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  /* ================= STATES ================= */

  const [general, setGeneral] = useState({
    platformName: "",
    supportEmail: "",
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
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
  });

  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUser: "",
    fromName: "",
    fromEmail: "",
    footer: "",
  });

  const [backup, setBackup] = useState({
    autoBackup: true,
    retentionDays: "30",
    backupWindow: "02:00-04:00",
  });

  /* ================= LOAD SETTINGS ================= */

  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings();

        setGeneral(data.general);
        setNotifications(data.notifications);
        setSecurity(data.security);
        setLocalization(data.localization);
        setEmailConfig(data.emailConfig);
        setBackup(data.backup);
      } catch (err) {
        console.error("Settings load failed", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ================= SAVE SETTINGS ================= */

  const handleSave = async () => {
    try {
      setSaving(true);

      await saveSettings({
        general,
        notifications,
        security,
        localization,
        emailConfig,
        backup,
      });

      setLastSaved(new Date().toLocaleString());
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            System Settings
          </h1>
          <p className="text-gray-600">
            Configure platform settings
          </p>
        </div>

        <div className="flex gap-3">
          {lastSaved && (
            <p className="text-xs text-gray-500">
              Last saved: {lastSaved}
            </p>
          )}

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GENERAL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform name</Label>
              <Input
                id="platformName"
                value={general.platformName}
                onChange={(e) =>
                  setGeneral((p) => ({
                    ...p,
                    platformName: e.target.value,
                  }))
                }
                placeholder="e.g., Learnix"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support email</Label>
              <Input
                id="supportEmail"
                type="email"
                value={general.supportEmail}
                onChange={(e) =>
                  setGeneral((p) => ({
                    ...p,
                    supportEmail: e.target.value,
                  }))
                }
                placeholder="support@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={general.logoUrl}
                onChange={(e) =>
                  setGeneral((p) => ({
                    ...p,
                    logoUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICATIONS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              Notifications
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Email updates</p>
                <p className="text-sm text-gray-500">
                  Send weekly learning summaries
                </p>
              </div>
              <Switch
                checked={notifications.emailUpdates}
                onCheckedChange={(v) =>
                  setNotifications((p) => ({
                    ...p,
                    emailUpdates: v,
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Product updates</p>
                <p className="text-sm text-gray-500">
                  Announce new features to users
                </p>
              </div>
              <Switch
                checked={notifications.productUpdates}
                onCheckedChange={(v) =>
                  setNotifications((p) => ({
                    ...p,
                    productUpdates: v,
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Billing alerts</p>
                <p className="text-sm text-gray-500">
                  Notify admins about payments
                </p>
              </div>
              <Switch
                checked={notifications.billingAlerts}
                onCheckedChange={(v) =>
                  setNotifications((p) => ({
                    ...p,
                    billingAlerts: v,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* SECURITY */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              Security
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Enforce 2FA</p>
                <p className="text-sm text-gray-500">
                  Require two-factor authentication
                </p>
              </div>
              <Switch
                checked={security.enforceTwoFactor}
                onCheckedChange={(v) =>
                  setSecurity((p) => ({
                    ...p,
                    enforceTwoFactor: v,
                  }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Allow Google login</p>
                <p className="text-sm text-gray-500">
                  Enable Google SSO for users
                </p>
              </div>
              <Switch
                checked={security.allowGoogleLogin}
                onCheckedChange={(v) =>
                  setSecurity((p) => ({
                    ...p,
                    allowGoogleLogin: v,
                  }))
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                value={security.sessionTimeout}
                onChange={(e) =>
                  setSecurity((p) => ({
                    ...p,
                    sessionTimeout: e.target.value,
                  }))
                }
                placeholder="30"
              />
            </div>
          </CardContent>
        </Card>

        {/* LOCALIZATION */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              Localization
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={localization.language}
                onValueChange={(v) =>
                  setLocalization((p) => ({ ...p, language: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={localization.timezone}
                onValueChange={(v) =>
                  setLocalization((p) => ({ ...p, timezone: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Asia/Calcutta">Asia/Calcutta</SelectItem>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date format</Label>
              <Select
                value={localization.dateFormat}
                onValueChange={(v) =>
                  setLocalization((p) => ({ ...p, dateFormat: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
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

        {/* EMAIL */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Email
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP host</Label>
                <Input
                  id="smtpHost"
                  value={emailConfig.smtpHost}
                  onChange={(e) =>
                    setEmailConfig((p) => ({
                      ...p,
                      smtpHost: e.target.value,
                    }))
                  }
                  placeholder="smtp.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP port</Label>
                <Input
                  id="smtpPort"
                  value={emailConfig.smtpPort}
                  onChange={(e) =>
                    setEmailConfig((p) => ({
                      ...p,
                      smtpPort: e.target.value,
                    }))
                  }
                  placeholder="587"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP username</Label>
              <Input
                id="smtpUser"
                value={emailConfig.smtpUser}
                onChange={(e) =>
                  setEmailConfig((p) => ({
                    ...p,
                    smtpUser: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromName">From name</Label>
                <Input
                  id="fromName"
                  value={emailConfig.fromName}
                  onChange={(e) =>
                    setEmailConfig((p) => ({
                      ...p,
                      fromName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromEmail">From email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  value={emailConfig.fromEmail}
                  onChange={(e) =>
                    setEmailConfig((p) => ({
                      ...p,
                      fromEmail: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer">Footer</Label>
              <Textarea
                id="footer"
                value={emailConfig.footer}
                onChange={(e) =>
                  setEmailConfig((p) => ({
                    ...p,
                    footer: e.target.value,
                  }))
                }
                placeholder="Email footer text…"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* BACKUP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Backup
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Automatic backups</p>
                <p className="text-sm text-gray-500">
                  Create daily backups automatically
                </p>
              </div>
              <Switch
                checked={backup.autoBackup}
                onCheckedChange={(v) =>
                  setBackup((p) => ({ ...p, autoBackup: v }))
                }
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Retention (days)</Label>
                <Input
                  id="retentionDays"
                  value={backup.retentionDays}
                  onChange={(e) =>
                    setBackup((p) => ({
                      ...p,
                      retentionDays: e.target.value,
                    }))
                  }
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupWindow">Backup window</Label>
                <Input
                  id="backupWindow"
                  value={backup.backupWindow}
                  onChange={(e) =>
                    setBackup((p) => ({
                      ...p,
                      backupWindow: e.target.value,
                    }))
                  }
                  placeholder="02:00-04:00"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
