import React from 'react';
import { Users2, Sparkles, Trophy, MessageSquare } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Create a room',
      desc: 'Start an instant game room and share the unique 4-letter link with your friends or family.',
      icon: <Sparkles className="size-6 text-pink-400" />,
      badge: 'Step 1',
    },
    {
      num: '2',
      title: 'Set up your teams',
      desc: 'Split into Red vs. Blue teams, or let auto-randomizer balance players fairly.',
      icon: <Users2 className="size-6 text-sky-400" />,
      badge: 'Step 2',
    },
    {
      num: '3',
      title: 'Play real-time multiplayer',
      desc: 'Guess in real time, race the clock, watch for taboo slips, and beat the other team!',
      icon: <Trophy className="size-6 text-amber-400" />,
      badge: 'Step 3',
    },
  ];

  return (
    <section aria-labelledby="how-it-works-heading" className="w-full px-4 py-8 sm:py-12 border-t border-white/[0.05]">
      <div className="mx-auto max-w-5xl text-center">
        <span className="text-xs uppercase tracking-widest font-semibold text-pink-400">
          Easy Setup
        </span>
        <h2
          id="how-it-works-heading"
          className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-8"
        >
          Play Taboo online in three steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
          {steps.map((step) => (
            <div
              key={step.num}
              className="relative rounded-2xl border border-white/[0.08] bg-[#141724]/70 p-6 shadow-sm hover:border-white/[0.15] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center justify-center size-12 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                    {step.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.04] px-2.5 py-1 rounded-full">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
