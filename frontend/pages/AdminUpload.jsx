
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateNoteDescription } from '../geminiService';

const AdminUpload = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Computer Science',
    price: '',
    description: '',
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!user || user.role !== 'ADMIN') {
    navigate('/dashboard');
    return null;
  }

  const handleAiDescription = async () => {
    if (!formData.title) return alert('Please enter a title first');
    setIsGenerating(true);
    const desc = await generateNoteDescription(formData.title, formData.subject);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('subject', formData.subject);
      fd.append('price', formData.price || '0');
      fd.append('description', formData.description);
      if (previewFile) fd.append('preview', previewFile);
      if (pdfFile) fd.append('pdf', pdfFile);

      const res = await fetch('http://localhost:4000/api/notes', {
        method: 'POST',
        headers: {
          'x-admin-pass': 'root'
        },
        body: fd
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      await res.json();
      alert('Note uploaded successfully!');
      navigate('/marketplace');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 lg:p-12 shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Upload Study Material</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Note Title</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                  placeholder="e.g. Physics Quantum Mechanics"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject Category</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition bg-gray-50"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                >
                  <option>Computer Science</option>
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Engineering</option>
                  <option>Biology</option>
                  <option>Business</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Price (USD)</label>
              <input 
                required
                type="number" 
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Description</label>
                <button 
                  type="button"
                  onClick={handleAiDescription}
                  disabled={isGenerating}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
                >
                  {isGenerating ? 'Generating...' : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.464 15.05a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 14a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                      GENERATE WITH AI
                    </>
                  )}
                </button>
              </div>
              <textarea 
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition"
                placeholder="What does this study guide cover? Highlights, topics, etc."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
               <label className="block text-sm font-bold text-gray-700 mb-4">PDF Document & Preview Image</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:border-blue-400 transition cursor-pointer">
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e)=> setPdfFile(e.target.files?.[0] || null)} />
                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <span className="text-sm font-medium text-gray-500">Upload PDF {pdfFile && <em className="text-gray-400">({pdfFile.name})</em>}</span>
                  </label>
                  <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:border-blue-400 transition cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e)=> setPreviewFile(e.target.files?.[0] || null)} />
                    <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <span className="text-sm font-medium text-gray-500">Upload Preview Image {previewFile && <em className="text-gray-400">({previewFile.name})</em>}</span>
                  </label>
               </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Publish Note to Marketplace
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;
