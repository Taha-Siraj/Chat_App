import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { GlobalContext } from '../context/Context';
import { api } from '../Api';
import { LuMail, LuLock, LuArrowRight, LuEye, LuEyeOff } from 'react-icons/lu';

export default function Login() {
  const { dispatch } = useContext(GlobalContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/api/v1/login', form);
      dispatch({ type: 'USER_LOGIN', user: data.user });
      toast.success('Welcome back');
      setTimeout(() => navigate('/chat'), 800);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0b141a] px-4 font-sans overflow-hidden">
      {/* Top Green Banner */}
      <div className="absolute top-0 left-0 w-full h-[222px] bg-[#00a884] z-0 flex items-center px-12 md:px-24">
        <div className="flex items-center gap-3.5 text-white font-semibold text-sm tracking-widest uppercase mb-10 select-none">
          <img 
            src="https://static.whatsapp.net/rsrc.php/v3/y6/r/R457WSN2Z2k.png" 
            className="w-8 h-8 object-contain invert brightness-200" 
            alt="logo" 
          />
          WhatsApp Web
        </div>
      </div>
      <Toaster position="top-center" />
      
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[420px] space-y-6 rounded-2xl bg-[#111b21] p-8 shadow-2xl z-10 relative border border-[#222d34] transition-all"
      >
        <div className="space-y-2 select-none">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Sign In
          </h1>
          <p className="text-xs text-zinc-400">Enter your credentials to connect your private session</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#00a884] uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative flex items-center">
              <LuMail className="absolute left-4 text-[#8696a0]" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@domain.com"
                className="pl-11 pr-4 py-3 rounded-xl bg-[#2a3942] border border-[#222d34] focus:border-[#00a884] text-white outline-none transition w-full placeholder-zinc-500 text-xs font-sans shadow-inner"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#00a884] uppercase tracking-wider mb-2">Password</label>
            <div className="relative flex items-center">
              <LuLock className="absolute left-4 text-[#8696a0]" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pl-11 pr-12 py-3 rounded-xl bg-[#2a3942] border border-[#222d34] focus:border-[#00a884] text-white outline-none transition w-full placeholder-zinc-500 text-xs font-sans shadow-inner"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-[#8696a0] hover:text-white transition"
              >
                {showPassword ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-bold text-xs uppercase tracking-wider transition-all duration-200 disabled:cursor-not-allowed mt-2 shadow"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#111b21] border-t-transparent" />
          ) : (
            <>
              Continue <LuArrowRight className="text-sm" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-zinc-400 pt-1 select-none">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-[#00a884] hover:text-[#00c59b] hover:underline transition"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}