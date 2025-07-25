import { Link } from 'react-router-dom';
import {
  FaComments,
  FaRocket,
  FaLock,
  FaMobileAlt,
  FaUsers,
} from 'react-icons/fa';
import Header from './Header';

const features = [
  {
    title: 'Blazing Fast',
    Icon: FaRocket,
    color: 'text-green-400',
    text: 'Send and receive messages instantly—no waiting.',
  },
  {
    title: 'Secure & Private',
    Icon: FaLock,
    color: 'text-yellow-400',
    text: 'End-to-end encryption keeps every chat safe.',
  },
  {
    title: 'Cross-Platform',
    Icon: FaMobileAlt,
    color: 'text-blue-400',
    text: 'Seamless sync across desktop, tablet & mobile.',
  },
  {
    title: 'User-Friendly',
    Icon: FaUsers,
    color: 'text-red-400',
    text: 'Clean, intuitive interface—chat without learning.',
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-black font-sans text-white">
        {/* Hero */}
        <section className="flex h-[calc(100vh-6rem)] flex-col items-center justify-center gap-y-4 px-4 text-center">
          <FaComments className="text-8xl text-indigo-500" />
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-7xl">
            Connect Instantly.
            <br />
            Chat Seamlessly.
          </h1>
          <p className="max-w-2xl text-sm text-gray-400 md:text-xl">
            Real-time conversations with friends, family & colleagues—fast,
            secure, and intuitive.
          </p>
          <Link
            to="/chat"
            className="rounded-full bg-indigo-600 px-8 py-3 text-lg font-semibold hover:bg-indigo-500"
          >
            Go to Chat
          </Link>
        </section>

        {/* Features */}
        <section className="bg-gray-900 py-16">
          <h2 className="text-center text-4xl font-extrabold">
            Why Choose ChatApp?
          </h2>
          <div className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, Icon, color, text }) => (
              <div
                key={title}
                className="flex flex-col items-center rounded-xl bg-gray-800 p-6"
              >
                <Icon className={`mb-3 text-4xl ${color}`} />
                <h3 className="mb-1 text-xl font-bold">{title}</h3>
                <p className="text-center text-sm text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center gap-y-4 py-20 px-4 text-center">
          <h2 className="text-4xl font-extrabold sm:text-5xl">
            Ready to Start Chatting?
          </h2>
          <p className="max-w-2xl text-sm text-gray-400 md:text-xl">
            Join thousands already enjoying seamless communication.
          </p>
          <Link
            to="/chat"
            className="rounded-full bg-indigo-600 px-8 py-3 text-lg font-semibold hover:bg-indigo-500"
          >
            Continue to Chat
          </Link>
        </section>
      </main>
    </>
  );
}