import { motion } from 'motion/react';
import { Shield, Video, MessageSquare, Smartphone, ArrowRight } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 py-20 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl text-center relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-500 text-xs font-bold uppercase tracking-widest mb-8"
        >
          Beta Access Now Open
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
          Private streams for the <span className="text-orange-500">people who matter.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
          Stream live or share videos privately — no strangers, no public feeds, no noise. Just you and your invited guests.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleLogin}
            className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
          >
            Start Streaming Now
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
            <span className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-white/10" />
              ))}
            </span>
            Join 2,400+ on the waitlist
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mt-32 relative z-10">
        {[
          { icon: Shield, title: "Invite-only", desc: "Your stream is only visible to those with your unique private link." },
          { icon: Video, title: "Live or MP4", desc: "Go live with your camera or upload pre-recorded videos for playback." },
          { icon: MessageSquare, title: "Live Chat", desc: "Real-time interaction with your viewers through our encrypted chat." },
          { icon: Smartphone, title: "Mobile-first", desc: "Designed for the phone in your pocket. Stream from anywhere, anytime." }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
              <feature.icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      <footer className="mt-40 text-white/20 text-xs font-mono tracking-widest uppercase">
        &copy; 2026 WeStream Private Network. All rights reserved.
      </footer>
    </div>
  );
}
