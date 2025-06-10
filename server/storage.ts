import { 
  users, tabs, bookmarks, history, securitySettings,
  type User, type InsertUser, type Tab, type InsertTab,
  type Bookmark, type InsertBookmark, type History, type InsertHistory,
  type SecuritySettings, type InsertSecuritySettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tab methods
  getTabs(userId: number): Promise<Tab[]>;
  getTab(id: number): Promise<Tab | undefined>;
  createTab(tab: InsertTab): Promise<Tab>;
  updateTab(id: number, updates: Partial<Tab>): Promise<Tab | undefined>;
  deleteTab(id: number): Promise<boolean>;
  
  // Bookmark methods
  getBookmarks(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number): Promise<boolean>;
  
  // History methods
  getHistory(userId: number): Promise<History[]>;
  addToHistory(history: InsertHistory): Promise<History>;
  clearHistory(userId: number): Promise<boolean>;
  
  // Security settings methods
  getSecuritySettings(userId: number): Promise<SecuritySettings | undefined>;
  updateSecuritySettings(userId: number, settings: InsertSecuritySettings): Promise<SecuritySettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tabs: Map<number, Tab> = new Map();
  private bookmarks: Map<number, Bookmark> = new Map();
  private historyEntries: Map<number, History> = new Map();
  private securitySettingsMap: Map<number, SecuritySettings> = new Map();
  private currentId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    
    // Create default security settings
    const defaultSettings: SecuritySettings = {
      id: this.currentId++,
      userId: id,
      adBlocker: true,
      trackerProtection: true,
      malwareProtection: true,
      userAgent: null,
    };
    this.securitySettingsMap.set(id, defaultSettings);
    
    return user;
  }

  // Tab methods
  async getTabs(userId: number): Promise<Tab[]> {
    return Array.from(this.tabs.values()).filter(tab => tab.userId === userId);
  }

  async getTab(id: number): Promise<Tab | undefined> {
    return this.tabs.get(id);
  }

  async createTab(insertTab: InsertTab): Promise<Tab> {
    const id = this.currentId++;
    const tab: Tab = { 
      ...insertTab, 
      id, 
      createdAt: new Date() 
    };
    this.tabs.set(id, tab);
    return tab;
  }

  async updateTab(id: number, updates: Partial<Tab>): Promise<Tab | undefined> {
    const tab = this.tabs.get(id);
    if (!tab) return undefined;
    
    const updatedTab = { ...tab, ...updates };
    this.tabs.set(id, updatedTab);
    return updatedTab;
  }

  async deleteTab(id: number): Promise<boolean> {
    return this.tabs.delete(id);
  }

  // Bookmark methods
  async getBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(bookmark => bookmark.userId === userId);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentId++;
    const bookmark: Bookmark = { 
      ...insertBookmark, 
      id, 
      createdAt: new Date() 
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(id: number): Promise<boolean> {
    return this.bookmarks.delete(id);
  }

  // History methods
  async getHistory(userId: number): Promise<History[]> {
    return Array.from(this.historyEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.visitedAt.getTime() - a.visitedAt.getTime());
  }

  async addToHistory(insertHistory: InsertHistory): Promise<History> {
    const id = this.currentId++;
    const historyEntry: History = { 
      ...insertHistory, 
      id, 
      visitedAt: new Date() 
    };
    this.historyEntries.set(id, historyEntry);
    return historyEntry;
  }

  async clearHistory(userId: number): Promise<boolean> {
    const userHistory = Array.from(this.historyEntries.entries())
      .filter(([_, entry]) => entry.userId === userId);
    
    userHistory.forEach(([id]) => this.historyEntries.delete(id));
    return true;
  }

  // Security settings methods
  async getSecuritySettings(userId: number): Promise<SecuritySettings | undefined> {
    return this.securitySettingsMap.get(userId);
  }

  async updateSecuritySettings(userId: number, settings: InsertSecuritySettings): Promise<SecuritySettings> {
    const existing = this.securitySettingsMap.get(userId);
    const updatedSettings: SecuritySettings = {
      id: existing?.id || this.currentId++,
      userId,
      ...settings,
    };
    this.securitySettingsMap.set(userId, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
