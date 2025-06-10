import { Shield, ShieldCheck, X } from "lucide-react";
import { Tab, SecuritySettings } from "@shared/schema";
import { useState, useEffect } from "react";
import { Globe } from 'lucide-react';

interface ContentAreaProps {
  activeTab?: Tab;
  securitySettings?: SecuritySettings;
  onTitleChange: (title: string) => void;
}

export default function ContentArea({ activeTab, securitySettings, onTitleChange }: ContentAreaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSecurityStatus, setShowSecurityStatus] = useState(true);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (activeTab?.url && activeTab.url !== "") {
      loadContent(activeTab.url);
    } else {
      setContent("");
    }
  }, [activeTab?.url]);

  const loadContent = async (url: string) => {
    setIsLoading(true);
    try {
      // Use proxy endpoint to bypass iframe restrictions
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (response.ok) {
        const html = await response.text();
        setContent(html);

        // Extract title from HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          onTitleChange(titleMatch[1]);
        }
      } else {
        // Let the server handle error pages instead of showing generic message
        const html = await response.text();
        setContent(html);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      setContent(`
        <div style="padding: 2rem; text-align: center; font-family: system-ui;">
          <h2>Connection Error</h2>
          <p>Unable to connect to the requested website. Please check your internet connection.</p>
        </div>
      `);
    } finally {
      setIsLoading(false);
    }
  };

  const SecurityStatusBar = () => (
    <div className="bg-green-500 text-white px-4 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4" />
        <span>Secure connection established - All content filtered and verified</span>
      </div>
      <div className="flex items-center space-x-4">
        {securitySettings?.adBlocker && (
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded">Ad Blocker: Active</span>
        )}
        {securitySettings?.trackerProtection && (
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded">Tracker Protection: ON</span>
        )}
        <button
          onClick={() => setShowSecurityStatus(false)}
          className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  const DemoContent = () => (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--browser-dark)' }}>
          SecureBrowser Demo Environment
        </h1>
        <p style={{ color: 'var(--browser-light)' }}>
          This is a demonstration of the SecureBrowser interface with advanced security features.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          {
            icon: Shield,
            title: "Security Bypass",
            description: "Advanced iframe and content restrictions bypass with safety protocols.",
            color: "text-green-500"
          },
          {
            icon: Shield,
            title: "Content Filtering",
            description: "Real-time ad blocking, malware detection, and content sanitization.",
            color: "text-blue-500"
          },
          {
            icon: Shield,
            title: "Privacy Mode",
            description: "Enhanced private browsing with user agent spoofing and tracking protection.",
            color: "text-gray-500"
          },
          {
            icon: Shield,
            title: "Smart History",
            description: "Intelligent browsing history with automatic categorization and search.",
            color: "text-yellow-500"
          },
          {
            icon: Shield,
            title: "Tab Management",
            description: "Advanced tab grouping, session management, and memory optimization.",
            color: "text-blue-500"
          },
          {
            icon: Shield,
            title: "Responsive Design",
            description: "Optimized interface that adapts to any screen size and device type.",
            color: "text-green-500"
          }
        ].map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <Icon className={`w-6 h-6 ${feature.color} mr-3`} />
                <h3 className="font-semibold" style={{ color: 'var(--browser-dark)' }}>
                  {feature.title}
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'var(--browser-light)' }}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Security Dashboard */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--browser-dark)' }}>
          Security Dashboard
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">247</div>
            <div className="text-xs" style={{ color: 'var(--browser-light)' }}>Threats Blocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">1,429</div>
            <div className="text-xs" style={{ color: 'var(--browser-light)' }}>Ads Filtered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">89</div>
            <div className="text-xs" style={{ color: 'var(--browser-light)' }}>Trackers Blocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: 'var(--browser-medium)' }}>15.2s</div>
            <div className="text-xs" style={{ color: 'var(--browser-light)' }}>Time Saved</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 relative">
      {/* Security Status Bar */}
      {showSecurityStatus && <SecurityStatusBar />}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 z-10">
          <div className="h-full bg-blue-500 w-1/3 loading-active"></div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="bg-white dark:bg-gray-900 h-full relative overflow-hidden browser-content">
        {activeTab?.url ? (
          <iframe
            src={`/api/proxy?url=${encodeURIComponent(activeTab.url)}`}
            className="w-full h-full border-0 block"
            style={{ height: 'calc(100vh - 140px)', minHeight: '600px' }}
            title={activeTab.title || "Web Content"}
            sandbox="allow-scripts allow-same-origin allow-forms allow-navigation allow-popups allow-top-navigation-by-user-activation"
            onError={(e) => {
              console.error('Failed to load iframe:', e);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-4">
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Welcome to SecureBrowser</h2>
              <p className="text-gray-600 mb-4">Enter a URL in the address bar to start browsing</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Try visiting:</p>
                <p>• https://www.google.com</p>
                <p>• https://www.example.com</p>
                <p>• https://httpbin.org</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}