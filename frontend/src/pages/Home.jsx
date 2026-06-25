import { Link } from 'react-router-dom';
import {
  LuMessageSquare,
  LuShieldCheck,
  LuSparkles,
  LuCompass,
  LuArrowRight,
  LuTerminal
} from 'react-icons/lu';
import Header from './Header';

const features = [
  {
    title: 'Instant Sockets',
    Icon: LuSparkles,
    text: 'Zero latency real-time communication powered by direct socket channels.',
  },
  {
    title: 'Signature Cryptography',
    Icon: LuShieldCheck,
    text: 'Multi-layer encrypted payload protocols securing your personal messages.',
  },
  {
    title: 'Reactive States',
    Icon: LuCompass,
    text: 'Synchronous state management across multiple client browser views.',
  },
  {
    title: 'Double Sidebar Dock',
    Icon: LuMessageSquare,
    text: 'A clean desktop interface featuring Vertical Navigation, tab views, and quick drawers.',
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0b141a] text-[#e9edef] pt-[70px] font-sans relative overflow-hidden transition-all">
        
        {/* Background Glowing Orb (Atmospheric) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00a884]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[calc(75vh-70px)] gap-y-6 px-6 text-center py-16 max-w-4xl mx-auto relative z-10 select-none">
          <div className="w-16 h-16 rounded-3xl bg-[#00a884]/10 border border-[#00a884]/20 flex items-center justify-center text-[#00a884] mb-3 shadow animate-pulse">
            <LuMessageSquare className="text-3xl" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white font-display">
            Connect Securely.<br />Chat in Real-Time.
          </h1>
          
          <p className="max-w-xl text-sm md:text-base text-zinc-400 font-light leading-relaxed">
            A premium, high-performance messaging client designed with pixel-perfect layouts, responsive drawers, and WebRTC streaming modules.
          </p>

          <div className="mt-4 flex gap-4">
            <Link
              to="/chat"
              className="px-6 py-3.5 bg-[#00a884] hover:bg-[#008f72] text-[#111b21] font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 shadow-lg flex items-center gap-2 hover:scale-105"
            >
              Open Console <LuArrowRight />
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-y border-[#222d34] bg-[#111b21] py-20 relative z-10 shadow-inner">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center mb-12 tracking-tight font-display text-white">System Specifications</h2>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ title, Icon, text }) => (
                <div
                  key={title}
                  className="p-6 rounded-2xl bg-[#0b141a] border border-[#222d34] flex flex-col items-start hover:border-[#00a884]/40 transition duration-300 group shadow-md"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/40 flex items-center justify-center text-zinc-400 group-hover:text-[#00a884] group-hover:bg-[#00a884]/10 transition duration-300 mb-4 border border-zinc-700/30">
                    <Icon className="text-lg" />
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-white tracking-wide">{title}</h3>
                  <p className="text-zinc-400 text-xs font-light leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center gap-y-5 py-24 px-6 text-center max-w-xl mx-auto relative z-10">
          <h2 className="text-3xl font-bold tracking-tight font-display text-white">Get started today</h2>
          <p className="text-zinc-400 text-xs md:text-sm font-light leading-relaxed">
            Create an account profile and immediately connect to active participants across the grid networks.
          </p>
          <Link
            to="/chat"
            className="px-6 py-3 bg-[#111b21] hover:bg-zinc-800 border border-[#222d34] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 flex items-center gap-2 hover:scale-105"
          >
            <LuTerminal /> Launch Terminal
          </Link>
        </section>
      </main>
    </>
  );
}