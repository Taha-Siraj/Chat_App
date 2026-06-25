import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../Api';
import { LuUser, LuMail, LuLock, LuArrowRight, LuEye, LuEyeOff } from 'react-icons/lu';

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) {
      toast.error('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/v1/signup', form);
      toast.success('Account Created');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
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
        className="w-full max-w-[440px] space-y-5 rounded-2xl bg-[#111b21] p-8 shadow-2xl z-10 relative border border-[#222d34] transition-all"
      >
        <div className="space-y-1.5 select-none">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create Account
          </h1>
          <p className="text-xs text-zinc-400">Register details to establish your secure node keys</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-[#00a884] uppercase tracking-wider mb-2">First Name</label>
            <div className="relative flex items-center">
              <LuUser className="absolute left-3 text-[#8696a0]" />
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                type="text"
                placeholder="First name"
                className="pl-9 pr-3 py-3 rounded-xl bg-[#2a3942] border border-[#222d34] focus:border-[#00a884] text-white outline-none transition w-full placeholder-zinc-550 text-xs font-sans shadow-inner"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#00a884] uppercase tracking-wider mb-2">Last Name</label>
            <div className="relative flex items-center">
              <LuUser className="absolute left-3 text-[#8696a0]" />
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                type="text"
                placeholder="Last name"
                className="pl-9 pr-3 py-3 rounded-xl bg-[#2a3942] border border-[#222d34] focus:border-[#00a884] text-white outline-none transition w-full placeholder-zinc-550 text-xs font-sans shadow-inner"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-[#00a884] uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative flex items-center">
            <LuMail className="absolute left-4 text-[#8696a0]" />
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="you@domain.com"
              className="pl-11 pr-4 py-3 rounded-xl bg-[#2a3942] border border-[#222d34] focus:border-[#00a884] text-white outline-none transition w-full placeholder-zinc-550 text-xs font-sans shadow-inner"
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
              value={form.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-11 pr-12 py-3 rounded-xl bg-[#2a3942] border border-[#222d34] focus:border-[#00a884] text-white outline-none transition w-full placeholder-zinc-550 text-xs font-sans shadow-inner"
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

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-bold text-xs uppercase tracking-wider transition-all duration-200 disabled:cursor-not-allowed mt-2 shadow"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#111b21] border-t-transparent" />
          ) : (
            <>
              Register <LuArrowRight className="text-sm" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-zinc-400 pt-1 select-none">
          Already a member?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#00a884] hover:text-[#00c59b] hover:underline transition"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}