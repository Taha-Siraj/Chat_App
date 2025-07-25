import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { api } from '../Api';

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) {
      toast.warning('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/v1/signup', form);
      toast.success('Account created');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'py-3 px-4 rounded-xl bg-slate-800 border border-slate-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition w-full placeholder-slate-500';

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-slate-900 p-10 shadow-2xl"
      >
        <h1 className="text-center text-3xl font-bold text-green-400">
          Create Account
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            type="text"
            placeholder="First name"
            className={inputClass}
            required
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            type="text"
            placeholder="Last name"
            className={inputClass}
            required
          />
        </div>

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          placeholder="Email"
          className={inputClass}
          required
        />

        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
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
            'Sign up'
          )}
        </button>

        <p className="text-center text-sm text-slate-400">
          Already a member?{' '}
          <Link
            to="/login"
            className="font-semibold text-green-400 hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}