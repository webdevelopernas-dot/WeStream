import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Video, Upload, Link as LinkIcon, Trash2, Users, Clock, Play, StopCircle, Check, Copy } from 'lucide-react';
import { auth, db, storage, collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, updateDoc, serverTimestamp, ref, uploadBytes, getDownloadURL } from '../firebase';
import { Stream } from '../types';
import { useNavigate } from 'react-router-dom';
import StreamPlayer from '../components/StreamPlayer';

export default function Dashboard() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const navigate = useNavigate();

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const q = query(
      collection(db, 'streams'),
      where('streamerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const s = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Stream[];
      setStreams(s);
    });

    return () => unsubscribe();
  }, [user]);

  const startLive = async () => {
    if (!user) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const inviteCode = Math.random().toString(36).substring(2, 10);
      const docRef = await addDoc(collection(db, 'streams'), {
        title: `${user.displayName}'s Live Stream`,
        streamerId: user.uid,
        streamerName: user.displayName,
        status: 'live',
        type: 'live',
        createdAt: serverTimestamp(),
        viewerCount: 0,
        inviteCode
      });

      setActiveStream({ id: docRef.id, title: `${user.displayName}'s Live Stream`, streamerId: user.uid, streamerName: user.displayName || '', status: 'live', type: 'live', createdAt: new Date(), viewerCount: 0, inviteCode });
      setIsLive(true);
    } catch (error) {
      console.error('Error starting live:', error);
    }
  };

  const stopLive = async () => {
    if (activeStream) {
      await updateDoc(doc(db, 'streams', activeStream.id), {
        status: 'offline'
      });
      
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      
      setIsLive(false);
      setActiveStream(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const inviteCode = Math.random().toString(36).substring(2, 10);
      await addDoc(collection(db, 'streams'), {
        title: file.name.replace(/\.[^/.]+$/, ""),
        streamerId: user.uid,
        streamerName: user.displayName,
        status: 'offline',
        type: 'video',
        videoUrl: url,
        createdAt: serverTimestamp(),
        viewerCount: 0,
        inviteCode
      });

      setIsUploading(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
    }
  };

  const deleteStream = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this stream?')) {
      await deleteDoc(doc(db, 'streams', id));
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/stream/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Dashboard</h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Manage your private network</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">{user?.displayName}</p>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Streamer ID: {user?.uid.substring(0, 8)}</p>
          </div>
          <img src={user?.photoURL || ''} className="w-10 h-10 rounded-full border border-white/10" alt="" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Control Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
            
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-orange-500" />
              Start New Broadcast
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={isLive ? stopLive : startLive}
                className={`flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 transition-all ${
                  isLive 
                  ? 'bg-red-500/10 border-red-500 text-red-500' 
                  : 'bg-white/5 border-white/10 hover:border-orange-500 hover:bg-orange-500/5 text-white'
                }`}
              >
                {isLive ? <StopCircle size={40} /> : <Video size={40} />}
                <div className="text-center">
                  <p className="font-bold">{isLive ? 'Stop Broadcast' : 'Go Live'}</p>
                  <p className="text-xs opacity-60">Camera & Microphone</p>
                </div>
              </button>

              <label className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white/5 border-2 border-white/10 border-dashed hover:border-orange-500 hover:bg-orange-500/5 transition-all cursor-pointer group">
                <Upload size={40} className="group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-bold">Upload MP4</p>
                  <p className="text-xs opacity-60">Stream pre-recorded video</p>
                </div>
                <input type="file" accept="video/mp4" className="hidden" onChange={handleUpload} disabled={isUploading} />
              </label>
            </div>

            {isUploading && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                  <span>Uploading Video...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {isLive && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Live Preview
              </h2>
              <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Users size={16} className="text-white/40" />
                    0 Viewers
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Clock size={16} className="text-white/40" />
                    00:00:00
                  </div>
                </div>
                <button 
                  onClick={() => copyLink(activeStream?.id || '')}
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-orange-500 hover:text-white transition-all"
                >
                  <LinkIcon size={14} />
                  Copy Invite Link
                </button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-tighter">Past Broadcasts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {streams.map((stream) => (
                <div key={stream.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 group hover:bg-white/10 transition-colors">
                  <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden relative">
                    {stream.type === 'video' ? (
                      <video src={stream.videoUrl} className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <Video size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/stream/${stream.id}`)}
                        className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform"
                      >
                        <Play size={20} fill="black" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm mb-1">{stream.title}</h3>
                      <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
                        {stream.type} &bull; {stream.createdAt?.toDate?.().toLocaleDateString() || 'Just now'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyLink(stream.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/20 text-white/60 hover:text-white transition-all"
                      >
                        {copiedId === stream.id ? <Check size={14} className="text-green-500" /> : <LinkIcon size={14} />}
                      </button>
                      <button 
                        onClick={() => deleteStream(stream.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h2 className="text-lg font-bold mb-6 uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Users size={18} />
              Network Stats
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-3xl font-black tracking-tighter">2,482</p>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Total Viewers</p>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tighter">14.2h</p>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Stream Duration</p>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tighter">{streams.length}</p>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">Total Broadcasts</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-500 rounded-3xl p-8 text-black">
            <h2 className="text-lg font-bold mb-2">Upgrade to Pro</h2>
            <p className="text-sm font-medium opacity-80 mb-6">Unlock screen sharing, scene overlays, and 4K streaming.</p>
            <button className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm hover:opacity-80 transition-opacity">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
