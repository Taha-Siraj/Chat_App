import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { GlobalContext } from '../context/Context';
import { api } from '../Api';

export default function Login() {
  const { dispatch } = useContext(GlobalContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.warning('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/api/v1/login', form);
      dispatch({ type: 'USER_LOGIN', user: data.user });
      toast.success('Welcome back');
      setTimeout(() => navigate('/alluser'), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'py-3 px-4 rounded-xl bg-slate-800 border border-slate-600 focus:border-green-500  focus:ring-2 focus:ring-green-500 outline-none transition w-full placeholder-slate-500';

  return (
    <div className="flex  min-h-screen items-center justify-center bg-black">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl bg-slate-900 p-10 shadow-2xl"
      >
        <h1 className="text-center text-3xl font-bold text-green-400">
          Welcome back
        </h1>

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className={inputClass}
          required
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className={inputClass}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-green-600 font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            'Log in'
          )}
        </button>

        <p className="text-center text-sm text-slate-400">
          Don’t have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-green-400 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}