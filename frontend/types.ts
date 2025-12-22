
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  description: string;
  price: number;
  previewImageUrl: string;
  pdfUrl: string; // Mock URL
  adminId: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  noteId: string;
  amount: number;
  date: string;
  status: 'COMPLETED' | 'FAILED';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
