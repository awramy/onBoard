export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Technology {
  id: string;
  name: string;
  description: string | null;
  levels: TechnologyLevel[];
}

export interface TechnologyLevel {
  id: string;
  technologyId: string;
  difficulty: string;
}

export interface InterviewSession {
  id: string;
  status: string;
  totalQuestions: number | null;
  currentOrder: number;
  createdAt: string;
  technologyLevel: TechnologyLevel & { technology: Technology };
}
