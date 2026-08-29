export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  language: 'en' | 'ur';
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  area?: string;
}

export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'water_leakage'
  | 'streetlight'
  | 'drainage'
  | 'traffic_signal'
  | 'road_damage'
  | 'other';

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface AIAnalysisResult {
  issueCategory: IssueCategory;
  confidence: number;
  severity: Severity;
  description: string;
  suggestedTitle: string;
  detectedObjects?: string[];
}

export interface Complaint {
  id: string;
  userId: string;
  title: string;
  description: string;
  issueCategory: IssueCategory;
  severity: Severity;
  status: ComplaintStatus;
  location: Location;
  images: string[];
  voiceTranscript?: string;
  aiAnalysis: AIAnalysisResult;
  assignedOrganization?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface Organization {
  id: string;
  name: string;
  nameUrdu?: string;
  email: string;
  phone?: string;
  categories: IssueCategory[];
  city: string;
  area?: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LanguageStrings {
  en: Record<string, string>;
  ur: Record<string, string>;
}