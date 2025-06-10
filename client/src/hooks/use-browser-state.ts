import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Tab, Bookmark, History, SecuritySettings, InsertTab, InsertBookmark, InsertHistory } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useBrowserState() {
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch tabs
  const { data: tabs = [] } = useQuery<Tab[]>({
    queryKey: ["/api/tabs"],
  });

  // Fetch bookmarks
  const { data: bookmarks = [] } = useQuery<Bookmark[]>({
    queryKey: ["/api/bookmarks"],
  });

  // Fetch history
  const { data: history = [] } = useQuery<History[]>({
    queryKey: ["/api/history"],
  });

  // Fetch security settings
  const { data: securitySettings } = useQuery<SecuritySettings>({
    queryKey: ["/api/security-settings"],
  });

  // Set active tab to first tab when tabs change
  useEffect(() => {
    if (tabs.length > 0 && !activeTabId) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  // Create tab mutation
  const createTabMutation = useMutation({
    mutationFn: async (tabData: InsertTab) => {
      const response = await apiRequest("POST", "/api/tabs", tabData);
      return response.json();
    },
    onSuccess: (newTab: Tab) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tabs"] });
      setActiveTabId(newTab.id);
      toast({
        title: "New tab created",
        description: `Created tab: ${newTab.title}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create new tab",
        variant: "destructive",
      });
    },
  });

  // Update tab mutation
  const updateTabMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Tab> }) => {
      const response = await apiRequest("PUT", `/api/tabs/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tabs"] });
    },
  });

  // Delete tab mutation
  const deleteTabMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tabs/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tabs"] });
      // Switch to another tab if deleting active tab
      if (activeTabId === arguments[0]) {
        const remainingTabs = tabs.filter(tab => tab.id !== arguments[0]);
        setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to close tab",
        variant: "destructive",
      });
    },
  });

  // Add bookmark mutation
  const addBookmarkMutation = useMutation({
    mutationFn: async (bookmarkData: InsertBookmark) => {
      const response = await apiRequest("POST", "/api/bookmarks", bookmarkData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Bookmark added",
        description: "Page has been bookmarked",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add bookmark",
        variant: "destructive",
      });
    },
  });

  // Delete bookmark mutation
  const deleteBookmarkMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/bookmarks/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: "Bookmark removed",
        description: "Bookmark has been deleted",
      });
    },
  });

  // Add to history mutation
  const addToHistoryMutation = useMutation({
    mutationFn: async (historyData: InsertHistory) => {
      const response = await apiRequest("POST", "/api/history", historyData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    },
  });

  // Helper functions
  const createTab = (tabData: InsertTab) => {
    createTabMutation.mutate(tabData);
  };

  const updateTab = (id: number, updates: Partial<Tab>) => {
    updateTabMutation.mutate({ id, updates });
  };

  const deleteTab = (id: number) => {
    deleteTabMutation.mutate(id);
  };

  const setActiveTab = (id: number) => {
    setActiveTabId(id);
  };

  const addBookmark = (bookmarkData: InsertBookmark) => {
    addBookmarkMutation.mutate(bookmarkData);
  };

  const deleteBookmark = (id: number) => {
    deleteBookmarkMutation.mutate(id);
  };

  const navigate = (url: string) => {
    if (activeTabId) {
      // Update current tab URL
      updateTab(activeTabId, { url });

      // Add to history
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        addToHistoryMutation.mutate({
          title: activeTab.title || "New Tab",
          url: url,
          userId: 1,
        });
      }
    } else if (tabs.length > 0) {
      // If no active tab but tabs exist, use the first one
      const firstTab = tabs[0];
      setActiveTabId(firstTab.id);
      updateTab(firstTab.id, { url });

      addToHistoryMutation.mutate({
        title: firstTab.title || "New Tab",
        url: url,
        userId: 1,
      });
    }
  };

  const goBack = () => {
    // Simplified back functionality
    toast({
      title: "Navigation",
      description: "Back functionality would be implemented here",
    });
  };

  const goForward = () => {
    // Simplified forward functionality
    toast({
      title: "Navigation",
      description: "Forward functionality would be implemented here",
    });
  };

  const refresh = () => {
    if (activeTabId) {
      const activeTab = tabs.find(tab => tab.id === activeTabId);
      if (activeTab) {
        // Force reload by updating the tab
        updateTab(activeTabId, { url: activeTab.url });
      }
    }
  };

  const updateSecuritySettings = (settings: Partial<SecuritySettings>) => {
    // Implementation would go here
    toast({
      title: "Settings updated",
      description: "Security settings have been updated",
    });
  };

  return {
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
  };
}