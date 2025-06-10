import { Globe, Shield, Lock, X, Plus } from "lucide-react";
import { Tab } from "@shared/schema";

interface TabBarProps {
  tabs: Tab[];
  activeTabId: number | null;
  onTabSelect: (id: number) => void;
  onTabClose: (id: number) => void;
  onNewTab: () => void;
}

export default function TabBar({ tabs, activeTabId, onTabSelect, onTabClose, onNewTab }: TabBarProps) {
  const getTabIcon = (tab: Tab) => {
    if (tab.url.includes('secure') || tab.url.includes('banking')) {
      return <Shield className="w-3 h-3 text-green-500 flex-shrink-0" />;
    }
    if (tab.url.includes('https')) {
      return <Lock className="w-3 h-3 text-blue-500 flex-shrink-0" />;
    }
    return <Globe className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--browser-light)' }} />;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center px-2">
        <div className="flex items-center flex-1 min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`browser-tab ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => onTabSelect(tab.id)}
            >
              {getTabIcon(tab)}
              <span 
                className="truncate flex-1 ml-2"
                style={{ color: 'var(--browser-dark)' }}
              >
                {tab.title || "New Tab"}
              </span>
              <button
                className="ml-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                style={{ color: 'var(--browser-light)' }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {tabs.length === 0 && (
            <div className="browser-tab active">
              <Globe className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--browser-light)' }} />
              <span 
                className="truncate flex-1 ml-2"
                style={{ color: 'var(--browser-dark)' }}
              >
                New Tab
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={onNewTab}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          style={{ color: 'var(--browser-light)' }}
          title="New Tab (Ctrl+T)"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
