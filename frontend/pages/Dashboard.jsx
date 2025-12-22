
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStore } from '../store';
import NoteCard from '../components/NoteCard';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [myNotes, setMyNotes] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const allNotes = getStore.notes();
    const allPurchases = getStore.purchases();

    if (user.role === 'ADMIN') {
      setMyNotes(allNotes.filter(n => n.adminId === user.id));
    } else {
      const userPurchases = allPurchases.filter(p => p.userId === user.id);
      const purchasedNotes = userPurchases
        .map(p => {
          const note = allNotes.find(n => n.id === p.noteId);
          return note ? { ...note, purchaseDate: p.date } : null;
        })
        .filter(Boolean);
      setPurchases(purchasedNotes);
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center space-x-4">
             <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xl font-bold">
               {user.name.charAt(0).toUpperCase()}
             </div>
             <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Project Dashboard</h1>
              <p className="text-sm text-slate-500">Workspace for {user.name} • <span className="capitalize">{user.role.toLowerCase()}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <button className="px-4 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">Settings</button>
             <Link to="/marketplace" className="px-4 py-2 text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition">Buy Your Notes</Link>
             {user.role === 'ADMIN' && (
              <Link to="/admin/upload" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm shadow-blue-100 flex items-center">
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                New Upload
              </Link>
             )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: user.role === 'ADMIN' ? 'Total Content' : 'Library Size', value: user.role === 'ADMIN' ? myNotes.length : purchases.length, suffix: 'files' },
            { label: user.role === 'ADMIN' ? 'Revenue' : 'Account Balance', value: user.role === 'ADMIN' ? `$${(myNotes.length * 45).toFixed(0)}` : `$${purchases.reduce((acc, p) => acc + p.price, 0).toFixed(0)}`, suffix: 'USD' },
            { label: 'Active Sessions', value: '1', suffix: 'devices' },
            { label: 'Role Authority', value: user.role, suffix: 'verified' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{stat.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {user.role === 'ADMIN' ? 'My Uploads' : 'Purchase History'}
            </h2>
            <Link to="/marketplace" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">Marketplace →</Link>
          </div>
          
          <div className="p-6">
            { (user.role === 'ADMIN' ? myNotes : purchases).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(user.role === 'ADMIN' ? myNotes : purchases).map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
                 <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                 </div>
                 <p className="text-sm text-slate-500 font-medium">No active files found.</p>
                 <Link to="/marketplace" className="text-xs font-bold text-blue-600 mt-2 inline-block">Start exploring</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
