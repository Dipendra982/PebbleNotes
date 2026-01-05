import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateStudyInsights } from '../geminiService';
import { setStore, getStore } from '../store';

const NoteDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState('Analyzing content with Gemini...');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/notes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNote({
            id: data.id,
            title: data.title,
            subject: data.subject,
            description: data.description,
            price: Number(data.price || 0),
            previewImageUrl: data.preview_image_url && data.preview_image_url.startsWith('/uploads') ? `http://localhost:4000${data.preview_image_url}` : data.preview_image_url,
            pdfUrl: data.pdf_url && data.pdf_url.startsWith('/uploads') ? `http://localhost:4000${data.pdf_url}` : data.pdf_url,
            createdAt: data.created_at || new Date().toISOString()
          });
          // After note loads, check purchase status (simple cached + server check)
          const session = getStore.session();
          const token = session?.token;
          if (token) {
            try {
              const r = await fetch(`http://localhost:4000/api/purchases/check/${data.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const j = await r.json().catch(() => ({ purchased: false }));
              setIsPurchased(Boolean(j?.purchased));
            } catch {}
          }
        } else {
          setNote(null);
        }
      } catch {
        setNote(null);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const run = async () => {
      if (!note) return;
      try {
        const text = await generateStudyInsights(note.title, note.description || '');
        setInsights(text);
      } catch {
        setInsights('Great for exam prep and concept clarity.');
      }
    };
    run();
  }, [note]);

  const handlePurchase = () => {
    if (!user) {
      navigate('/signin');
      return;
    }
    setShowPaymentModal(true);
  };

  const processKhaltiPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (!user || !note) {
        setIsProcessing(false);
        return;
      }
      const session = getStore.session();
      const token = session?.token;
      const payload = {
        note_id: note.id,
        amount: note.price,
        payment_method: 'KHALTI',
        transaction_id: Math.random().toString(36).slice(2),
        payment_reference: 'demo',
        payment_response: { success: true }
      };

      const persist = async () => {
        try {
          if (token) {
            const res = await fetch('http://localhost:4000/api/purchases', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            });
            const j = await res.json();
            if (!res.ok) throw new Error(j?.error || 'Purchase failed');
            // Cache to local storage (simple catchmemory for project)
            setStore.purchase({
              id: j.id,
              userId: user.id,
              noteId: note.id,
              amount: note.price,
              date: j.purchased_at || new Date().toISOString(),
              status: j.status || 'COMPLETED'
            });
          } else {
            // Fallback cache even if token missing
            setStore.purchase({
              id: Math.random().toString(36).slice(2),
              userId: user.id,
              noteId: note.id,
              amount: note.price,
              date: new Date().toISOString(),
              status: 'COMPLETED'
            });
          }
          setIsPurchased(true);
        } catch (e) {
          alert(e.message);
        } finally {
          setIsProcessing(false);
          setShowPaymentModal(false);
        }
      };
      persist();
    }, 1500);
  };

  if (!note) return null;

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cover Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="aspect-[3/4] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50 group relative">
                <img src={note.previewImageUrl} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition duration-700" alt={note.title} />
                {!isPurchased && (
                   <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                        Purchase to Unlock Full PDF
                      </div>
                   </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-7">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase border border-slate-200">{note.subject}</span>
                <span className="text-[10px] font-medium text-slate-400">Published {new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">{note.title}</h1>
              <p className="text-slate-500 leading-relaxed text-sm lg:text-base">{note.description}</p>
            </div>

            {/* AI Insights Card */}
            <div className="mb-10 bg-slate-900 rounded-xl p-6 overflow-hidden relative border border-slate-800">
               <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                    Gemini Intelligence Engine
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                  </div>
               </div>
               <div className="text-slate-300 text-xs leading-relaxed font-mono whitespace-pre-line">
                 {insights}
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"></path></svg>
               </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
                             {isPurchased ? (
                 <div className="flex flex-col space-y-4">
                   <div className="flex items-center space-x-2 text-emerald-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                      <span className="text-xs font-bold uppercase tracking-wider">Asset Unlocked</span>
                   </div>
                                     {note.pdfUrl ? (
                                       <a href={note.pdfUrl} target="_blank" rel="noopener" download className="bg-slate-900 text-white px-8 py-3.5 rounded-lg font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center space-x-2 shadow-xl shadow-slate-200">
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                         <span>Download Verified PDF</span>
                                       </a>
                                     ) : (
                                       <div className="text-xs text-slate-500">PDF not provided for this note.</div>
                                     )}
                 </div>
              ) : (
                <div className="flex items-center justify-between">
                   <div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Standard License</span>
                     <span className="text-2xl font-bold text-slate-900">${note.price.toFixed(2)}</span>
                   </div>
                   <button onClick={handlePurchase} className="bg-blue-600 text-white px-10 py-3.5 rounded-lg font-bold text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100">
                     Checkout with Khalti
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>
            </div>
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <span className="text-xl">💳</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">Secure Checkout</h2>
                <p className="text-xs text-slate-500">Khalti Gateway Verification</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-xs py-2 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Item</span>
                  <span className="font-bold text-slate-900 truncate max-w-[150px]">{note.title}</span>
                </div>
                <div className="flex justify-between text-xs py-2 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Amount</span>
                  <span className="font-bold text-slate-900">${note.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-slate-900">Total Payable</span>
                  <span className="text-lg font-bold text-indigo-600">${note.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={processKhaltiPayment} disabled={isProcessing} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center disabled:opacity-50">
                  {isProcessing ? 'Verifying...' : 'Pay with Khalti'}
                </button>
                <button onClick={() => setShowPaymentModal(false)} disabled={isProcessing} className="w-full text-slate-400 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition">
                  Cancel Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDetail;
