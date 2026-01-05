
import React, { useState, useEffect } from 'react';
import { getStore } from '../store';
import NoteCard from '../components/NoteCard';

const Marketplace = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('All');

  useEffect(() => {
    setNotes(getStore.notes());
  }, []);

  const subjects = ['All', ...Array.from(new Set(getStore.notes().map(n => n.subject)))];

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.description.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subject === 'All' || n.subject === subject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-16 border-b border-slate-100 pb-14">
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tighter mb-4">Marketplace</h1>
          <p className="text-slate-500 font-medium text-lg">Verified study guides, lecture notes, and research materials.</p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-5 mb-14">
          <div className="flex-grow relative w-full">
            <svg className="w-5 h-5 absolute left-5 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Filter by title, topic, or instructor..." 
              className="w-full pl-14 pr-5 py-4 text-base font-bold rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-0 outline-none transition bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select 
              className="w-full py-4 px-5 text-base font-bold rounded-xl border border-slate-200 focus:border-slate-900 outline-none transition bg-white text-slate-600 appearance-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-slate-200 rounded-3xl bg-white">
            <p className="text-base font-medium text-slate-400">No matching resources found.</p>
            <button 
              onClick={() => { setSearch(''); setSubject('All'); }}
              className="mt-5 text-sm font-bold text-blue-600 hover:underline uppercase tracking-widest"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
