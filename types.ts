
export interface MathStep {
  title: string;
  description: string;
  latex?: string;
}

export interface MathSolution {
  problemSummary: string;
  steps: MathStep[];
  finalAnswer: string;
  conceptExplanation: string;
  relatedFormulas: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  solution?: MathSolution;
  image?: string;
  timestamp: number;
}
