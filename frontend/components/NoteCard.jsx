
import React from 'react';
import { Link } from 'react-router-dom';

const NoteCard = ({ note }) => {
  return (
    <Link to={`/notes/${note.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-lg flex flex-col h-full">
        <div className="aspect-[16/10] relative overflow-hidden bg-slate-50">
          <img 
            src={note.previewImageUrl} 
            alt={note.title} 
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-0.5 rounded text-[10px] font-bold text-slate-600 border border-slate-200 uppercase tracking-tighter">
            {note.subject}
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-sm font-bold text-slate-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition">{note.title}</h3>
          <p className="text-slate-500 text-xs mb-5 line-clamp-2 leading-relaxed flex-grow">{note.description}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <span className="text-sm font-bold text-slate-900">${note.price.toFixed(2)}</span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
              Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;
