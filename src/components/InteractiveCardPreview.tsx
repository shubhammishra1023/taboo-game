import React, { useState, useEffect } from 'react';
import { Home, LogOut, HelpCircle, Settings, Send, Star, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { sounds } from '../utils/audio';

export const InteractiveCardPreview: React.FC = () => {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [redScore, setRedScore] = useState(71);
  const [blueScore, setBlueScore] = useState(67);
  const [timeRemaining, setTimeRemaining] = useState(42);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; user?: string; text: string; isSystem?: boolean }>>([
    { id: '1', user: 'brainlag', text: 'witch' },
    { id: '2', text: 'Turn ended. Last word: "Wizard"', isSystem: true },
    { id: '3', user: 'alex99', text: 'space guy?' },
  ]);

  const cards = [
    {
      word: 'Astronaut',
      pts: 6,
      tabooWords: ['SPACE', 'NASA', 'MOON', 'ROCKET', 'SUIT'],
    },
    {
      word: 'Telescope',
      pts: 4,
      tabooWords: ['STARS', 'SPACE', 'LOOK', 'GLASS', 'ASTRONOMY'],
    },
    {
      word: 'Submarine',
      pts: 5,
      tabooWords: ['OCEAN', 'UNDERWATER', 'BOAT', 'TORPEDO', 'DIVE'],
    },
  ];

  const card = cards[currentWordIdx % cards.length];

  // Subtle clock ticking in preview
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 1 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleBuzz = (taboo?: string) => {
    sounds.playBuzz();
    setRedScore((s) => Math.max(0, s - 1));
    setFeedback(taboo ? `BUZZED! Taboo word "${taboo}" detected! (-1 pt)` : 'BUZZED! (-1 pt)');
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: `🚨 Buzz! Opponent flagged taboo word (-1 pt)`, isSystem: true },
    ]);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleCorrect = () => {
    sounds.playCorrect();
    setRedScore((s) => s + card.pts);
    setFeedback(`CORRECT! +${card.pts} pts!`);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), user: 'brainlag', text: card.word.toLowerCase() },
      { id: (Date.now() + 1).toString(), text: `🎉 Got it! "${card.word}" (+${card.pts} pts)`, isSystem: true },
    ]);
    setTimeout(() => {
      setFeedback(null);
      setCurrentWordIdx((prev) => (prev + 1) % cards.length);
    }, 1200);
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const g = guessInput.trim();
    if (!g) return;

    if (g.toLowerCase() === card.word.toLowerCase()) {
      handleCorrect();
    } else {
      sounds.playClick();
      setMessages((prev) => [...prev, { id: Date.now().toString(), user: 'You', text: g }]);
    }
    setGuessInput('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-4 pb-16 select-none">
      {/* Game Stage Container matching Screenshot 1 bottom */}
      <div className="rounded-3xl border border-zinc-800 bg-[#0d0f1c] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Game Navigation & Status Bar */}
        <div className="px-5 py-4 border-b border-zinc-800/80 bg-[#121526] flex items-center justify-between">
          {/* Left: Home & Leave */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
              <Home className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-rose-400 hover:text-rose-300 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Scores & Round Clock */}
          <div className="flex items-center gap-8">
            {/* Red Score */}
            <span className="text-3xl sm:text-4xl font-black text-[#e93d67] tracking-tight">
              {redScore}
            </span>

            {/* Timer & Round */}
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest font-mono">
                0:{timeRemaining < 10 ? `0${timeRemaining}` : timeRemaining}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">
                ROUND 4 OF 5
              </span>
            </div>

            {/* Blue Score */}
            <span className="text-3xl sm:text-4xl font-black text-[#3b82f6] tracking-tight">
              {blueScore}
            </span>
          </div>

          {/* Right: Helpers & Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hidden sm:flex">
              <HelpCircle className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hidden sm:flex">
              <Settings className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium">
              <span>🇬🇧</span>
              <span>EN</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-yellow-400 border border-zinc-700 overflow-hidden flex items-center justify-center text-xs font-bold text-black">
              👱
            </div>
          </div>
        </div>

        {/* Live Turn Grid matching Screenshot 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
          {/* Left Column: The Taboo Card (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800/80 bg-[#101322]">
            <div>
              {/* Card Header Points */}
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {card.pts} pts
                </span>

                <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                  DESCRIBE THIS WORD
                </span>
              </div>

              {/* Secret Word */}
              <div className="text-center py-4 mb-5">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-sm font-['Fredoka',sans-serif]">
                  {card.word}
                </h2>
              </div>

              {/* Taboo Forbidden Words */}
              <div className="space-y-2 max-w-sm mx-auto">
                <div className="text-center mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                    Taboo Words (Do Not Say)
                  </span>
                </div>
                {card.tabooWords.map((taboo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleBuzz(taboo)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#161a2e] hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-500/40 text-zinc-200 text-sm font-bold tracking-wide transition-all group"
                  >
                    <span>{taboo}</span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover:text-rose-400 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" />
                      Buzz
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback & Actions */}
            <div className="mt-6 pt-4 border-t border-zinc-800/60">
              {feedback && (
                <div className="mb-3 text-center text-xs font-bold text-pink-400 bg-pink-500/10 py-1.5 px-3 rounded-lg border border-pink-500/20 animate-fade-in">
                  {feedback}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleBuzz()}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <AlertOctagon className="w-4 h-4" />
                  Buzz (-1 pt)
                </button>
                <button
                  onClick={handleCorrect}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Got It! (+{card.pts})
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat & Guess Stream (5 cols) */}
          <div className="md:col-span-5 p-5 flex flex-col justify-between bg-[#0e101c]">
            <div>
              {/* Explaining status bar with audio visualizer waves */}
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161a2e] border border-zinc-800 text-xs font-semibold text-zinc-300 mb-4">
                <span className="text-base">🧑‍🚀</span>
                <span className="text-rose-400 font-bold">idkbro</span>
                <span>is explaining</span>
                {/* Audio Equalizer Waves */}
                <span className="inline-flex items-center gap-0.5 ml-auto text-pink-500 font-mono font-bold tracking-tighter animate-pulse">
                  <span className="w-1 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDuration: '0.6s' }} />
                  <span className="w-1 h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDuration: '0.4s' }} />
                  <span className="w-1 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDuration: '0.7s' }} />
                  <span className="w-1 h-5 bg-pink-500 rounded-full animate-bounce" style={{ animationDuration: '0.5s' }} />
                </span>
              </div>

              {/* Chat Stream Messages */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 text-xs">
                {messages.map((m) =>
                  m.isSystem ? (
                    <div
                      key={m.id}
                      className="text-zinc-400 italic bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800/80 flex items-center gap-2"
                    >
                      <span>🗂️</span>
                      <span>{m.text}</span>
                    </div>
                  ) : (
                    <div key={m.id} className="flex items-baseline gap-2">
                      <span className="font-bold text-amber-400">{m.user}:</span>
                      <span className="text-zinc-200">{m.text}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Guess Input Field */}
            <form onSubmit={handleGuessSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                value={guessInput}
                onChange={(e) => setGuessInput(e.target.value)}
                placeholder="Type a guess..."
                className="flex-1 bg-[#141728] border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
