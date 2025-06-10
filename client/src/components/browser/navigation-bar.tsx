import { ArrowLeft, ArrowRight, RotateCcw, Shield, Lock, Star, Share, Puzzle, Settings, UserCircle } from "lucide-react";
import { Tab } from "@shared/schema";
import { useState } from "react";
import React from "react";

interface NavigationBarProps {
  activeTab?: Tab;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onBookmark: (bookmark: { title: string; url: string; favicon: string | null; userId: number }) => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export default function NavigationBar({
  activeTab,
  onNavigate,
  onBack,
  onForward,
  onRefresh,
  onBookmark,
  canGoBack,
  canGoForward,
}: NavigationBarProps) {
  const [addressValue, setAddressValue] = useState(activeTab?.url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update address bar when active tab changes
  React.useEffect(() => {
    setAddressValue(activeTab?.url || "");
  }, [activeTab?.url]);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !addressValue.trim()) return;

    setIsSubmitting(true);
    try {
      let url = addressValue.trim();
      // Improved search detection - if it contains spaces or doesn't look like a URL
      const hasSpaces = url.includes(' ');
      const hasNoTLD = !url.includes('.') || url.split('.').length < 2;
      const isSearchQuery = hasSpaces || hasNoTLD || 
        (!url.startsWith('http://') && !url.startsWith('https://') && hasNoTLD);

      if (isSearchQuery) {
        // Generate comprehensive Google search URL with all parameters
        const params = new URLSearchParams();
        params.append('q', url);
        params.append('source', 'hp');
        params.append('sclient', 'gws-wiz');
        params.append('uact', '5');
        params.append('sca_esv', Math.random().toString(36).substring(2, 18));
        params.append('ei', Math.random().toString(36).substring(2, 18));
        params.append('iflsig', 'AOw8s4IAAAAAaEd8EwCpc6JljWV3fai-Gxi76OQQrTWV');
        params.append('ved', '0ahUKEwj327jzvuWNAxXciO4BHcPlAYcQ4dUDCA8');
        params.append('oq', url);
        params.append('gs_lp', 'Egdnd3Mtd2l6');
        
        url = `https://www.google.com/search?${params.toString()}`;
      } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Add https:// if it looks like a domain
        url = `https://${url}`;
      }

      onNavigate(url);
    } finally {
      setTimeout(() => setIsSubmitting(false), 1000);
    }
  };

  const handleBookmark = () => {
    if (activeTab && activeTab.url) {
      onBookmark({
        title: activeTab.title,
        url: activeTab.url,
        favicon: activeTab.favicon,
        userId: 1,
      });
    }
  };

  const isSecure = activeTab?.url?.startsWith('https://');
  const isSecureContent = activeTab?.url?.includes('secure') || activeTab?.url?.includes('banking');

  return (
    <div className="browser-nav-bar">
      <div className="flex items-center space-x-3">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
            style={{ color: 'var(--browser-light)' }}
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onForward}
            disabled={!canGoForward}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
            style={{ color: 'var(--browser-light)' }}
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            style={{ color: 'var(--browser-light)' }}
            title="Refresh (Ctrl+R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Address Bar */}
        <form onSubmit={handleAddressSubmit} className="flex-1">
          <div className="browser-address-bar">
            <div className="flex items-center space-x-2 mr-3">
              {isSecureContent && (
                <div title="Secure Connection">
                  <Shield className="w-4 h-4 text-green-500" />
                </div>
              )}
              {isSecure && (
                <div title="HTTPS Encrypted">
                  <Lock className="w-3 h-3 text-blue-500" />
                </div>
              )}
            </div>

            <input
              type="text"
              value={addressValue}
              onChange={(e) => setAddressValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitting) {
                  e.preventDefault();
                  handleAddressSubmit(e as any);
                }
              }}
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--browser-dark)' }}
              placeholder="Search or enter website URL"
              data-address-bar
              autoComplete="off"
              enterKeyHint="go"
              inputMode="text"
              disabled={isSubmitting}
            />

            <div className="flex items-center space-x-2 ml-3">
              <button
                type="button"
                onClick={handleBookmark}
                className="hover:text-yellow-500 transition-colors"
                style={{ color: 'var(--browser-light)' }}
                title="Bookmark this page"
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="hover:opacity-70 transition-opacity"
                style={{ color: 'var(--browser-light)' }}
                title="Share page"
              >
                <Share className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors relative"
            style={{ color: 'var(--browser-light)' }}
            title="Extensions"
          >
            <Puzzle className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            style={{ color: 'var(--browser-light)' }}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            style={{ color: 'var(--browser-light)' }}
            title="Profile"
          >
            <UserCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}