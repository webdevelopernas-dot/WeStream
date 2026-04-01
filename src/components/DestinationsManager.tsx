import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from '../firebase';
import { Destination } from '../types';
import { Youtube, Facebook, Globe, Plus, Trash2, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DestinationsManagerProps {
  userId: string;
}

export default function DestinationsManager({ userId }: DestinationsManagerProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newDest, setNewDest] = useState({
    platform: 'youtube' as const,
    name: '',
    rtmpUrl: '',
    streamKey: '',
    enabled: true
  });

  useEffect(() => {
    const q = query(collection(db, `users/${userId}/destinations`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Destination[];
      setDestinations(dests);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let rtmpUrl = newDest.rtmpUrl;
      if (newDest.platform === 'youtube' && !rtmpUrl) rtmpUrl = 'rtmp://a.rtmp.youtube.com/live2';
      if (newDest.platform === 'facebook' && !rtmpUrl) rtmpUrl = 'rtmps://live-api-s.facebook.com:443/rtmp/';

      await addDoc(collection(db, `users/${userId}/destinations`), {
        ...newDest,
        rtmpUrl,
        userId,
        createdAt: new Date()
      });
      setIsAdding(false);
      setNewDest({ platform: 'youtube', name: '', rtmpUrl: '', streamKey: '', enabled: true });
    } catch (error) {
      console.error('Error adding destination:', error);
    }
  };

  const toggleDest = async (id: string, current: boolean) => {
    await updateDoc(doc(db, `users/${userId}/destinations`, id), {
      enabled: !current
    });
  };

  const deleteDest = async (id: string) => {
    if (window.confirm('Remove this destination?')) {
      await deleteDoc(doc(db, `users/${userId}/destinations`, id));
    }
  };

  const getIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return <Youtube className="text-red-500" />;
      case 'facebook': return <Facebook className="text-blue-500" />;
      default: return <Globe className="text-orange-500" />;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tighter">Multi-Stream Destinations</h2>
          <p className="text-xs text-white/40 font-mono uppercase tracking-widest mt-1">Simulcast to other platforms</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="bg-white/5 border border-white/20 rounded-2xl p-6 space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-2">
                {(['youtube', 'facebook', 'custom'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewDest({ ...newDest, platform: p })}
                    className={`py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                      newDest.platform === p ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Destination Name (e.g. My Channel)"
                value={newDest.name}
                onChange={(e) => setNewDest({ ...newDest, name: e.target.value })}
                className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                required
              />

              {newDest.platform === 'custom' && (
                <input
                  type="text"
                  placeholder="RTMP Server URL"
                  value={newDest.rtmpUrl}
                  onChange={(e) => setNewDest({ ...newDest, rtmpUrl: e.target.value })}
                  className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              )}

              <input
                type="password"
                placeholder="Stream Key"
                value={newDest.streamKey}
                onChange={(e) => setNewDest({ ...newDest, streamKey: e.target.value })}
                className="w-full bg-white/10 border-none rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                required
              />

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                  <Save size={18} /> Save Destination
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="bg-white/10 text-white p-3 rounded-xl hover:bg-white/20 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {destinations.length === 0 && !isAdding && (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
            <Globe size={40} className="mx-auto text-white/10 mb-4" />
            <p className="text-sm text-white/40">No destinations configured yet.</p>
          </div>
        )}

        {destinations.map((dest) => (
          <div key={dest.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                {getIcon(dest.platform)}
              </div>
              <div>
                <h3 className="font-bold text-sm">{dest.name}</h3>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">{dest.platform}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleDest(dest.id, dest.enabled)}
                className={`p-2 transition-colors ${dest.enabled ? 'text-orange-500' : 'text-white/20'}`}
              >
                {dest.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
              <button 
                onClick={() => deleteDest(dest.id)}
                className="p-2 text-white/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
