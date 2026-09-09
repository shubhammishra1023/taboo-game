import React, { useState } from 'react';
import { X, Send, Heart, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface InfoModalProps {
  type: 'howToPlay' | 'feedback' | 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const InfoModals: React.FC<InfoModalProps> = ({ type, onClose }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!type) return null;

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    sounds.playCorrect();
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#121524] p-6 sm:p-8 shadow-2xl my-auto text-zinc-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {type === 'howToPlay' && (
              <>
                <HelpCircle className="w-5 h-5 text-pink-400" />
                <span>How to Play Stormio Taboo</span>
              </>
            )}
            {type === 'feedback' && '💌 Send Feedback'}
            {type === 'terms' && '📜 Terms of Service'}
            {type === 'privacy' && '🔒 Privacy Policy'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* How to Play */}
        {type === 'howToPlay' && (
          <div className="space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-[#0e101c] p-4 rounded-2xl border border-zinc-800/80">
              <h4 className="font-bold text-pink-400 text-sm mb-1">1. The Goal</h4>
              <p>
                Get your teammates to guess the secret word at the top of the card as quickly as possible before the timer runs out!
              </p>
            </div>
            <div className="bg-[#0e101c] p-4 rounded-2xl border border-zinc-800/80">
              <h4 className="font-bold text-rose-400 text-sm mb-1">2. Forbidden Taboo Words</h4>
              <p>
                You <strong className="text-white">CANNOT</strong> say the secret word, any translations or variations, rhymes with, sounds like, or any of the 5 forbidden words listed on the card.
              </p>
            </div>
            <div className="bg-[#0e101c] p-4 rounded-2xl border border-zinc-800/80">
              <h4 className="font-bold text-sky-400 text-sm mb-1">3. Guessing & Scoring</h4>
              <p>
                Teammates type guesses into the chat. Each correct guess scores <strong className="text-emerald-400 font-bold">+1 point</strong>. The team with the most points at the end of all rounds wins!
              </p>
            </div>
            <div className="bg-[#0e101c] p-4 rounded-2xl border border-zinc-800/80">
              <h4 className="font-bold text-amber-400 text-sm mb-1">4. Opponents & Buzzers</h4>
              <p>
                The opposing team watches the card. If the explainer accidentally says any taboo word, hit the <strong className="text-rose-400 font-bold">BUZZER</strong> to flag the violation and deduct 1 point!
              </p>
            </div>
          </div>
        )}

        {/* Feedback */}
        {type === 'feedback' && (
          <div>
            {feedbackSent ? (
              <div className="text-center py-8 space-y-2">
                <div className="text-3xl">💖</div>
                <h4 className="text-lg font-bold text-white">Thank you for your feedback!</h4>
                <p className="text-xs text-zinc-400">
                  Your suggestions help make Stormio Taboo even better for game nights everywhere.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Have a suggestion, found a typo on a card, or want to request a new category? Let us know!
                </p>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts, bugs, or feature ideas..."
                  className="w-full bg-[#0e101c] border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 font-medium resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Feedback</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Terms */}
        {type === 'terms' && (
          <div className="space-y-3 text-xs text-zinc-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <p>
              Stormio Taboo is an online party game platform provided for casual social entertainment and vocabulary learning among friends.
            </p>
            <h5 className="font-bold text-white text-xs pt-1">Fair Play & Community</h5>
            <p>
              Players are encouraged to enjoy fair competition. Profanity, harassment, or malicious automation are prohibited in public rooms.
            </p>
            <h5 className="font-bold text-white text-xs pt-1">Trademarks & Intellectual Property</h5>
            <p>
              Taboo is a registered trademark of Hasbro, Inc. Stormio is an independent, non-commercial fan recreation and is not endorsed by or affiliated with Hasbro.
            </p>
          </div>
        )}

        {/* Privacy */}
        {type === 'privacy' && (
          <div className="space-y-3 text-xs text-zinc-300 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <p>
              Your privacy is fundamental to our design. Stormio Taboo operates completely without mandatory account creation or tracking cookies.
            </p>
            <h5 className="font-bold text-white text-xs pt-1">Stored Information</h5>
            <p>
              Your custom avatar, display name, and custom word packs are stored locally within your browser using localStorage.
            </p>
            <h5 className="font-bold text-white text-xs pt-1">Free & Open</h5>
            <p>
              Stormio Taboo is completely free for everyone. We do not sell user data, track personal browsing habits, or serve third-party ad networks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
