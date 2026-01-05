const USERS_KEY = 'pebble_users';
const NOTES_KEY = 'pebble_notes';
const PURCHASES_KEY = 'pebble_purchases';
const SESSION_KEY = 'pebble_session';

// No seed data; rely on backend API

export const getStore = {
  users: () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]'),
  notes: () => JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'),
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
