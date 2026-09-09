import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do you play Taboo online?',
      a: 'Players split into two teams (Red vs. Blue). Each round, one player acts as the Explainer and describes a secret word to their teammates without saying any of the 5 forbidden "taboo" words. Teammates type their guesses in the live chat. Meanwhile, the opposing team monitors the taboo list and presses the buzzer if a forbidden word is spoken.',
    },
    {
      q: 'Do I or my friends need to download anything or sign up?',
      a: 'No! Stormio is 100% web-based and requires zero downloads or mandatory account creation. Simply click "Create a Room", share your room link or 4-letter code (e.g. CUBZ) with friends, and start playing right in your browser.',
    },
    {
      q: 'What devices are supported?',
      a: 'Stormio works smoothly on all devices with a modern web browser: smartphones (iOS Safari, Android Chrome), tablets, laptops, and desktop computers. Layouts adapt cleanly for touch and keyboard controls.',
    },
    {
      q: 'How many players can join a game?',
      a: 'Taboo is ideal for 4 or more players (2+ per team), but Stormio also supports single-player testing with automated bot practice players so you can test and enjoy the game anytime even when alone!',
    },
    {
      q: 'Can I create my own custom word packs?',
      a: 'Yes! You can easily create custom word packs with your own favorite inside jokes, company jargon, school curriculum, or movie themes using the built-in Word Pack Creator.',
    },
    {
      q: 'What is Quick Six mode?',
      a: 'Quick Six is a fast-paced sprint mode where the explainer gets exactly 6 words without taboo lists or skips. Each word successfully guessed by your team earns points as you race against the clock.',
    },
  ];

  return (
    <section className="w-full px-4 py-8 sm:py-12 border-t border-white/[0.05]">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest font-semibold text-pink-400">
            FAQ
          </span>
          <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#141724]/70 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-zinc-100 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`size-4 text-pink-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04] mt-1 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
