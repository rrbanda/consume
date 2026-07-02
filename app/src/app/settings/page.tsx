export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Settings are saved locally</p>
      </div>

      {/* Notifications */}
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Notifications
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Task Updates</p>
            <p className="text-xs text-gray-500">Get notified when tasks change status</p>
          </div>
          <div className="h-6 w-11 rounded-full bg-green-600 relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Approval Requests</p>
            <p className="text-xs text-gray-500">Get notified when approvals are needed</p>
          </div>
          <div className="h-6 w-11 rounded-full bg-green-600 relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Budget Alerts</p>
            <p className="text-xs text-gray-500">Notify when budget thresholds are reached</p>
          </div>
          <div className="h-6 w-11 rounded-full bg-gray-600 relative cursor-pointer">
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Theme</p>
            <p className="text-xs text-gray-500">Choose your preferred theme</p>
          </div>
          <select className="rounded-lg border border-white/[0.06] bg-[#292929] px-3 py-1.5 text-sm text-white focus:outline-none">
            <option>Dark</option>
            <option>Light</option>
            <option>System</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Compact Mode</p>
            <p className="text-xs text-gray-500">Reduce spacing and card sizes</p>
          </div>
          <div className="h-6 w-11 rounded-full bg-gray-600 relative cursor-pointer">
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-[#1f1f1f] rounded-xl border border-gray-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
          Preferences
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Default Project</p>
            <p className="text-xs text-gray-500">Pre-select project for new requests</p>
          </div>
          <select className="rounded-lg border border-white/[0.06] bg-[#292929] px-3 py-1.5 text-sm text-white focus:outline-none">
            <option>None</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Auto-refresh</p>
            <p className="text-xs text-gray-500">Automatically refresh task lists</p>
          </div>
          <select className="rounded-lg border border-white/[0.06] bg-[#292929] px-3 py-1.5 text-sm text-white focus:outline-none">
            <option>Every 30s</option>
            <option>Every 60s</option>
            <option>Manual</option>
          </select>
        </div>
      </div>
    </div>
  );
}
