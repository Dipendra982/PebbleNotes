
import { User, Note, Purchase } from './types';

const USERS_KEY = 'pebble_users';
const NOTES_KEY = 'pebble_notes';
const PURCHASES_KEY = 'pebble_purchases';
const SESSION_KEY = 'pebble_session';

// Seed data if empty
const initialNotes = [
  {
    id: '1',
    title: 'Advanced Calculus Semester 1',
    subject: 'Mathematics',
    description: 'Comprehensive notes covering limits, derivatives, and integrations with solved examples.',
    price: 15.00,
    previewImageUrl: 'https://picsum.photos/seed/math1/400/300',
    pdfUrl: '#',
    adminId: 'admin1',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Data Structures in C++',
    subject: 'Computer Science',
    description: 'Deep dive into linked lists, trees, graphs, and algorithm complexity analysis.',
    price: 25.00,
    previewImageUrl: 'https://picsum.photos/seed/cs1/400/300',
    pdfUrl: '#',
    adminId: 'admin1',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Organic Chemistry II',
    subject: 'Chemistry',
    description: 'Focus on reaction mechanisms and spectroscopy. Includes high-quality diagrams.',
    price: 10.00,
    previewImageUrl: 'https://picsum.photos/seed/chem1/400/300',
    pdfUrl: '#',
    adminId: 'admin1',
    createdAt: new Date().toISOString()
  }
];

export const getStore = {
  users: () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  notes: () => {
    const stored = localStorage.getItem(NOTES_KEY);
    if (!stored) {
      localStorage.setItem(NOTES_KEY, JSON.stringify(initialNotes));
      return initialNotes;
    }
    return JSON.parse(stored);
  },
  purchases: () => JSON.parse(localStorage.getItem(PURCHASES_KEY) || '[]'),
  session: () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'),
};

export const setStore = {
  user: (user) => {
    const users = getStore.users();
    if (!users.find(u => u.email === user.email)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
    }
  },
  note: (note) => {
    const notes = getStore.notes();
    localStorage.setItem(NOTES_KEY, JSON.stringify([...notes, note]));
  },
  deleteNote: (id) => {
    const notes = getStore.notes().filter(n => n.id !== id);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  },
  purchase: (purchase) => {
    const purchases = getStore.purchases();
    localStorage.setItem(PURCHASES_KEY, JSON.stringify([...purchases, purchase]));
  },
  session: (user) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
};
