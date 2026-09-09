import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Flame, Users, Zap } from 'lucide-react';

export const HowToPlaySection: React.FC = () => {
  return (
    <section className="w-full px-4 py-8 sm:py-12 border-t border-white/[0.05]">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-pink-400">
            Game Rules
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
            How to play Taboo online
          </h2>
          <p className="mt-2 text-zinc-400 text-sm max-w-lg mx-auto">
            Simple rules, endless laughs. Here is how every round works.
          </p>
        </div>

        {/* 4 Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl border border-white/[0.08] bg-[#141724]/70 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center size-7 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs">
                1
              </span>
              <h3 className="text-base font-bold text-white">Split into Teams</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Players split into <strong className="text-rose-400">Red Team</strong> and{' '}
              <strong className="text-sky-400">Blue Team</strong>. Teams take turns having one player act as the Explainer.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#141724]/70 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center size-7 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs">
                2
              </span>
              <h3 className="text-base font-bold text-white">Describe the Secret Word</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              The explainer must describe the word on their screen without saying the secret word, any variations, or any of the 5 forbidden taboo words!
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#141724]/70 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center size-7 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs">
                3
              </span>
              <h3 className="text-base font-bold text-white">Teammates Guess Fast</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Teammates frantically type guesses in the live chat. Any correct guess scores <strong className="text-emerald-400">+1 point</strong> instantly!
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#141724]/70 p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center size-7 rounded-lg bg-pink-500/20 text-pink-400 font-bold text-xs">
                4
              </span>
              <h3 className="text-base font-bold text-white">Opponents Watch & Buzz</h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              The opposing team can see the taboo card. If the explainer accidentally says a taboo word, hit the <strong className="text-rose-400">BUZZER</strong> to penalize 1 point!
            </p>
          </div>
        </div>

        {/* Quick Six Mode Banner */}
        <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-pink-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
              <Zap className="size-6 fill-pink-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">Also Featuring: Quick Six Mode</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 border border-pink-500/40 text-pink-300 uppercase">
                  Fast Pace
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                6 rapid-fire cards, no taboo forbidden list, and no skips. Race the clock to describe all 6 words before time expires!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
