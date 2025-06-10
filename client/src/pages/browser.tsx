import { useState, useEffect } from "react";
import TitleBar from "@/components/browser/title-bar";
import TabBar from "@/components/browser/tab-bar";
import NavigationBar from "@/components/browser/navigation-bar";
import BookmarkBar from "@/components/browser/bookmark-bar";
import ContentArea from "@/components/browser/content-area";
import StatusBar from "@/components/browser/status-bar";
import SecurityWarningModal from "@/components/browser/security-warning-modal";
import { useBrowserState } from "@/hooks/use-browser-state";

export default function Browser() {
  const {
    tabs,
    activeTabId,
    bookmarks,
    history,
    securitySettings,
    createTab,
    updateTab,
    deleteTab,
    setActiveTab,
    addBookmark,
    deleteBookmark,
    navigate,
    goBack,
    goForward,
    refresh,
    updateSecuritySettings,
  } = useBrowserState();

  const [isMobile, setIsMobile] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [securityWarningData, setSecurityWarningData] = useState<{
    url: string;
    reason: string;
  } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 't':
            event.preventDefault();
            createTab({
              title: "New Tab",
              url: "",
              favicon: null,
              isActive: true,
              userId: 1,
            });
            break;
          case 'w':
            event.preventDefault();
            if (activeTabId) {
              deleteTab(activeTabId);
            }
            break;
          case 'r':
            event.preventDefault();
            refresh();
            break;
          case 'l':
            event.preventDefault();
            // Focus address bar
            const addressBar = document.querySelector('input[data-address-bar]') as HTMLInputElement;
            if (addressBar) {
              addressBar.focus();
              addressBar.select();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTabId, createTab, deleteTab, refresh]);

  const [isNavigating, setIsNavigating] = useState(false);

  // Create default tab if none exist
  useEffect(() => {
    if (tabs.length === 0) {
      createTab({
        title: "New Tab",
        url: "",
        favicon: null,
        isActive: true,
        userId: 1,
      });
    }
  }, [tabs.length]);

  const handleNavigate = async (url: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    try {
      const response = await fetch('/api/validate-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      
      const validation = await response.json();
      
      if (!validation.isSafe) {
        setSecurityWarningData({ url, reason: validation.reason });
        setShowSecurityWarning(true);
        return;
      }
      
      navigate(url);
    } catch (error) {
      console.error('Failed to validate URL:', error);
      navigate(url);
    } finally {
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  const handleSecurityWarningContinue = () => {
    if (securityWarningData) {
      navigate(securityWarningData.url);
    }
    setShowSecurityWarning(false);
    setSecurityWarningData(null);
  };

  const handleSecurityWarningCancel = () => {
    setShowSecurityWarning(false);
    setSecurityWarningData(null);
  };

  return (
    <div className={`browser-window ${isMobile ? 'mobile-layout' : ''}`}>
      <TitleBar />
      
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={setActiveTab}
        onTabClose={deleteTab}
        onNewTab={() => createTab({
          title: "New Tab",
          url: "",
          favicon: null,
          isActive: true,
          userId: 1,
        })}
      />
      
      <NavigationBar
        activeTab={tabs.find(tab => tab.id === activeTabId)}
        onNavigate={handleNavigate}
        onBack={goBack}
        onForward={goForward}
        onRefresh={refresh}
        onBookmark={addBookmark}
        canGoBack={history.length > 1}
        canGoForward={false} // Simplified for demo
      />
      
      <BookmarkBar
        bookmarks={bookmarks}
        onBookmarkClick={(url) => handleNavigate(url)}
        onBookmarkDelete={deleteBookmark}
      />
      
      <ContentArea
        activeTab={tabs.find(tab => tab.id === activeTabId)}
        securitySettings={securitySettings}
        onTitleChange={(title) => {
          if (activeTabId) {
            updateTab(activeTabId, { title });
          }
        }}
      />
      
      <StatusBar
        securitySettings={securitySettings}
        stats={{
          threatsBlocked: 247,
          adsFiltered: 1429,
          trackersBlocked: 89,
          timeSaved: "15.2s"
        }}
      />
      
      <SecurityWarningModal
        isOpen={showSecurityWarning}
        url={securityWarningData?.url || ""}
        reason={securityWarningData?.reason || ""}
        onContinue={handleSecurityWarningContinue}
        onCancel={handleSecurityWarningCancel}
      />
    </div>
  );
}
