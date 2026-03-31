import React, { useState, useEffect, useRef } from 'react';
import { db, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from '../firebase';
import { Message } from '../types';
import { Send, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  streamId: string;
  userName: string;
}

export default function Chat({ streamId, userName }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, `streams/${streamId}/messages`),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [streamId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, `streams/${streamId}/messages`), {
        streamId,
        userName,
        text: newMessage,
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
      <div className="p-3 border-bottom border-white/10 bg-white/5">
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Chat
        </h3>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col"
            >
              <span className="text-[10px] font-bold text-white/40 mb-0.5">{msg.userName}</span>
              <div className="bg-white/10 rounded-2xl rounded-tl-none px-3 py-2 text-sm text-white/90 inline-block max-w-[90%]">
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-white/5 border-top border-white/10 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/10 border-none rounded-full px-4 py-2 text-sm text-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
        />
        <button 
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
