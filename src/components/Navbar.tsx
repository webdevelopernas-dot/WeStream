import { auth, signOut } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Video } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-[#050505]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
          <Video size={20} />
        </div>
        <span className="text-xl font-black tracking-tighter uppercase">WeStream</span>
      </Link>

      {user && (
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors">
            Dashboard
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
