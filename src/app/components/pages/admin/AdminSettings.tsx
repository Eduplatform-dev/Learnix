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

      {/* KEEP ALL YOUR EXISTING CARDS EXACTLY SAME */}
      {/* (No UI changed — your current JSX stays here) */}
    </div>
  );
}