import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Mail,
  Users,
  Building2,
  Sparkles,
  Palette,
  Clock,
  Download,
  Upload,
  Key,
  Lock,
  Zap,
  ChevronRight
} from "lucide-react";

export default function SettingsPage() {
  const settingsSections = [
    {
      title: "Profile & Account",
      description: "Manage your personal information and account settings",
      icon: User,
      color: "blue",
      items: [
        { name: "Profile Information", href: "#", description: "Update your personal details" },
        { name: "Email & Password", href: "#", description: "Change your email or password" },
        { name: "Two-Factor Authentication", href: "#", description: "Add extra security to your account" },
      ]
    },
    {
      title: "Team & Organization",
      description: "Manage team members and organization settings",
      icon: Users,
      color: "green",
      items: [
        { name: "Team Members", href: "#", description: "Invite and manage team members" },
        { name: "Roles & Permissions", href: "#", description: "Set access levels for team members" },
        { name: "Organization Details", href: "#", description: "Update company information" },
      ]
    },
    {
      title: "Notifications",
      description: "Configure how you receive alerts and updates",
      icon: Bell,
      color: "purple",
      items: [
        { name: "Email Notifications", href: "#", description: "Manage email alert preferences" },
        { name: "Stock Alerts", href: "#", description: "Configure low stock notifications" },
        { name: "System Updates", href: "#", description: "Get notified about system changes" },
      ]
    },
    {
      title: "Security & Privacy",
      description: "Manage security settings and privacy preferences",
      icon: Shield,
      color: "red",
      items: [
        { name: "Login Sessions", href: "#", description: "View and manage active sessions" },
        { name: "API Keys", href: "#", description: "Manage API access tokens" },
        { name: "Audit Logs", href: "#", description: "View security audit trail" },
      ]
    },
    {
      title: "System Configuration",
      description: "Configure system-wide settings and preferences",
      icon: Settings,
      color: "orange",
      items: [
        { name: "General Settings", href: "#", description: "Set system preferences" },
        { name: "Warehouse Defaults", href: "#", description: "Configure default warehouse settings" },
        { name: "Units & Measurements", href: "#", description: "Set default units for products" },
      ]
    },
    {
      title: "Data Management",
      description: "Export, import, and manage your data",
      icon: Database,
      color: "teal",
      items: [
        { name: "Export Data", href: "#", description: "Download your data as CSV or Excel" },
        { name: "Import Data", href: "#", description: "Bulk import products and contacts" },
        { name: "Data Retention", href: "#", description: "Configure data retention policies" },
      ]
    },
  ];

  const quickActions = [
    { name: "Export All Data", icon: Download, color: "green" },
    { name: "Import Products", icon: Upload, color: "blue" },
    { name: "Generate API Key", icon: Key, color: "purple" },
    { name: "View Audit Log", icon: Lock, color: "orange" },
  ];

  const systemStatus = {
    version: "2.5.1",
    environment: "Production",
    lastBackup: "2 hours ago",
    uptime: "99.9%",
  };

  return (
    <div className="flex-1 space-y-8 pb-8">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-4 sm:p-6 md:p-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />

          {/* Floating particles */}
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + i}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  Settings
                </h1>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    v{systemStatus.version}
                  </span>
                </div>
              </div>
              <p className="text-base text-muted-foreground mt-1">
                Configure your system preferences and manage account settings
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.name}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 hover:bg-background/80 transition-all duration-200 hover:scale-105 text-sm group"
                >
                  <Icon className={`h-4 w-4 text-${action.color}-500`} />
                  <span>{action.name}</span>
                  <Sparkles className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="rounded-xl border border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">System Status</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-muted-foreground">Environment:</span>
              <span className="font-medium">{systemStatus.environment}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Last Backup:</span>
              <span className="font-medium">{systemStatus.lastBackup}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-medium">{systemStatus.uptime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          const colors = {
            blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-500",
            green: "from-green-500/10 to-green-500/5 border-green-500/20 text-green-500",
            purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-500",
            red: "from-red-500/10 to-red-500/5 border-red-500/20 text-red-500",
            orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-500",
            teal: "from-teal-500/10 to-teal-500/5 border-teal-500/20 text-teal-500",
          };

          return (
            <div
              key={section.title}
              className="group rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-2 bg-gradient-to-r ${colors[section.color as keyof typeof colors].split(' ')[0]}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br ${colors[section.color as keyof typeof colors]} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="text-lg font-semibold mb-1">{section.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>

                <div className="space-y-2">
                  {section.items.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group/item"
                    >
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent overflow-hidden">
        <div className="border-b border-red-500/20 bg-red-500/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Danger Zone
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all duration-200 hover:scale-105">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Theme preferences saved locally</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>support@agenthacks.com</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Last synced: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}