import React from 'react';
import { Gamepad2, Wifi, Layers, Sliders, ShieldCheck, Zap } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Free to Play',
      desc: 'No downloads required. Create a room and share the link with friends in seconds. Works right in any browser.',
      icon: <Gamepad2 className="size-5 text-emerald-400" />,
      color: 'from-emerald-500/10 to-transparent',
    },
    {
      title: 'Play Live with Friends',
      desc: 'Jump in from anywhere across the globe. Fast real-time multiplayer with synchronized countdown timers, live buzzers, and instant chat.',
      icon: <Wifi className="size-5 text-sky-400" />,
      color: 'from-sky-500/10 to-transparent',
    },
    {
      title: 'Multiple Word Packs',
      desc: 'Choose from General Words, Countries & Cities, Famous People, Movies & Series, Food & Drink, Animals, Pop Culture, or build your own custom packs.',
      icon: <Layers className="size-5 text-pink-400" />,
      color: 'from-pink-500/10 to-transparent',
    },
    {
      title: 'Make It Your Way',
      desc: 'Customize the number of rounds, turn timer duration (30s to 120s), number of taboo words, and skip rules to match your party.',
      icon: <Sliders className="size-5 text-amber-400" />,
      color: 'from-amber-500/10 to-transparent',
    },
  ];

  return (
    <section className="w-full px-4 py-8 sm:py-12 border-t border-white/[0.05]">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-pink-400">
            Why Stormio
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            Why Play Taboo Online?
          </h2>
          <p className="mt-2 text-zinc-400 text-sm max-w-xl mx-auto">
            Perfect for virtual game nights, team building, classroom activities, or family reunions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feat, i) => (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141724]/80 p-6 sm:p-7 shadow-sm hover:border-white/[0.15] transition-all bg-gradient-to-br ${feat.color}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center size-10 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {feat.title}
                </h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
