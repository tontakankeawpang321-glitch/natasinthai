export interface Lesson {
  id: string;
  chapterNumber: number;
  title: string;
  subtitle: string;
  shortDesc: string;
  detailedContent: {
    introduction: string;
    sections: {
      heading: string;
      body: string;
      bulletPoints?: string[];
    }[];
    keyTakeaways: string[];
    historicalContext?: string;
  };
  externalPath: string;
  youtubeId: string;
  videoTitle: string;
  category: string;
  audioDuration?: string;
}

export interface VideoItem {
  id: string;
  category: string;
  title: string;
  description: string;
  url: string;
  youtubeId: string;
  thumbnailUrl: string;
  chapterNumber?: number;
}

export interface QuizQuestion {
  id: number;
  chapterId: number;
  chapterName: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface BookItem {
  id: string;
  category: string;
  title: string;
  description: string;
  url: string;
  type?: 'pdf' | 'gdoc' | 'docx' | 'sheet' | 'web';
  chapterNumber?: number;
  author?: string;
  pages?: string;
}

export type NavTab = 'home' | 'videos' | 'exam' | 'books' | 'games' | 'chat' | 'bookmarks';
