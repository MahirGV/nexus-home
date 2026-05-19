export interface Bookmark {
  id: string;
  name: string;
  url: string;
  icon?: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  bookmarks: Bookmark[];
  icon?: string;
}

export interface UserSettings {
  background: string;
  themeColor: string;
  searchEngine: string;
  userName: string;
  dockSize: number;
  widgetSize: 'small' | 'medium' | 'large';
  visibleSystemInfo: string[];
  sortingMode: 'manual' | 'alphabetical';
  visibleWidgets: string[];
  showDesktopSearch: boolean;
}
