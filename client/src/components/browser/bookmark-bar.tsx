import { Home, Shield, EyeOff, Filter, Globe, X } from "lucide-react";
import { Bookmark } from "@shared/schema";

interface BookmarkBarProps {
  bookmarks: Bookmark[];
  onBookmarkClick: (url: string) => void;
  onBookmarkDelete: (id: number) => void;
}

export default function BookmarkBar({ bookmarks, onBookmarkClick, onBookmarkDelete }: BookmarkBarProps) {
  const defaultBookmarks = [
    { id: -1, title: "Home", url: "https://www.google.com", icon: Home, color: "text-blue-500" },
    { id: -2, title: "Security Tools", url: "https://security-tools.example.com", icon: Shield, color: "text-green-500" },
    { id: -3, title: "Privacy Center", url: "https://privacy.example.com", icon: EyeOff, color: "text-gray-500" },
    { id: -4, title: "Content Filters", url: "https://filters.example.com", icon: Filter, color: "text-yellow-500" },
    { id: -5, title: "Web Tools", url: "https://webtools.example.com", icon: Globe, color: "text-gray-400" },
  ];

  const allBookmarks = [...defaultBookmarks, ...bookmarks.map(b => ({ ...b, icon: Globe, color: "text-gray-400" }))];

  return (
    <div className="browser-bookmark-bar">
      <div className="flex items-center space-x-4 overflow-x-auto bookmark-bar">
        {allBookmarks.map((bookmark) => {
          const Icon = bookmark.icon;
          return (
            <div key={bookmark.id} className="flex items-center group">
              <button
                onClick={() => onBookmarkClick(bookmark.url)}
                className="flex items-center space-x-2 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs whitespace-nowrap transition-colors"
                style={{ color: 'var(--browser-dark)' }}
              >
                <Icon className={`w-3 h-3 ${bookmark.color}`} />
                <span>{bookmark.title}</span>
              </button>
              
              {bookmark.id > 0 && (
                <button
                  onClick={() => onBookmarkDelete(bookmark.id)}
                  className="ml-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-all"
                  title="Remove bookmark"
                >
                  <X className="w-3 h-3 text-red-500" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
