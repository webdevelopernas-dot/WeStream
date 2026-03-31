import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, onSnapshot, updateDoc, increment } from '../firebase';
import { Stream } from '../types';
import StreamPlayer from '../components/StreamPlayer';
import Chat from '../components/Chat';
import { Users, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StreamView() {
  const { id } = useParams<{ id: string }>();
  const [stream, setStream] = useState<Stream | null>(null);
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(doc(db, 'streams', id), (doc) => {
      if (doc.exists()) {
        setStream({ id: doc.id, ...doc.data() } as Stream);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    // Increment viewer count on join
    updateDoc(doc(db, 'streams', id), {
      viewerCount: increment(1)
    });

    return () => {
      unsubscribe();
      // Decrement viewer count on leave
      if (id) {
        updateDoc(doc(db, 'streams', id), {
          viewerCount: increment(-1)
        });
      }
    };
  }, [id]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    setIsJoined(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
        <Shield size={64} className="text-white/10 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Stream Not Found</h1>
        <p className="text-white/40 text-center max-w-xs mb-8">This private link may have expired or the stream was deleted.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-white text-black px-8 py-3 rounded-full font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <AnimatePresence>
        {!isJoined && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-sm w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-6">
                <Shield size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Private Network</h2>
              <p className="text-white/40 text-sm mb-8">You've been invited to a private broadcast. Please enter a display name to join the chat.</p>
              
              <form onSubmit={handleJoin} className="space-y-4">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Display Name"
                  className="w-full bg-white/10 border-none rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-colors"
                >
                  Join Stream
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col lg:flex-row h-screen overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 flex flex-col p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full">
            <StreamPlayer 
              url={stream.videoUrl} 
              isLive={stream.status === 'live'} 
            />
            
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase mb-2">{stream.title}</h1>
                <div className="flex items-center gap-4 text-white/40 text-xs font-mono uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    Hosted by {stream.streamerName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    {stream.viewerCount} Viewers
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-xs font-bold">
                  <Shield size={14} className="text-green-500" />
                  Private Link Active
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white/5 border border-white/10 rounded-3xl">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
                <Info size={16} />
                About this stream
              </h3>
              <p className="text-white/60 leading-relaxed">
                This is a private broadcast on the WeStream network. The content is unlisted and only accessible via this unique invite link. Please do not share this link publicly to maintain the privacy of the streamer and other viewers.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-[400px] h-[400px] lg:h-full p-4 lg:p-8 lg:pl-0">
          <Chat streamId={stream.id} userName={userName} />
        </div>
      </main>
    </div>
  );
}
