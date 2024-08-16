export interface GeneratedPost {
    image: Blob;
    caption: string;
    hashtags: string[];
  }
  
  export interface LayoutSuggestion {
    background: string;
    elementPositions: ElementPosition[];
  }
  
  export interface ElementPosition {
    type: 'product' | 'logo' | 'text';
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  export interface PostAnalytics {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }