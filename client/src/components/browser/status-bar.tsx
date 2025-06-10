import { Wifi, Shield } from "lucide-react";
import { SecuritySettings } from "@shared/schema";

interface StatusBarProps {
  securitySettings?: SecuritySettings;
  stats: {
    threatsBlocked: number;
    adsFiltered: number;
    trackersBlocked: number;
    timeSaved: string;
  };
}

export default function StatusBar({ securitySettings, stats }: StatusBarProps) {
  return (
    <div className="browser-status-bar">
      <div className="flex items-center space-x-4">
        <span>Ready</span>
        <span className="flex items-center space-x-1 security-indicator secure">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </span>
        <span className="flex items-center space-x-1 security-indicator secure">
          <Shield className="w-3 h-3" />
          <span>Protected</span>
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span>Threats: {stats.threatsBlocked}</span>
        <span>Ads: {stats.adsFiltered}</span>
        <span>Trackers: {stats.trackersBlocked}</span>
        <span>Version 2.1.0</span>
      </div>
    </div>
  );
}
