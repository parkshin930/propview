export interface NewsItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  tag?: {
    name: string;
    icon: string;
    color: string;
  };
  metrics: {
    views: number;
    bookmarks: number;
    comments: number;
  };
  isHighlighted?: boolean;
  hasQuickOrder?: boolean;
}

export interface TopStory {
  id: string;
  rank: number;
  title: string;
  link: string;
}
