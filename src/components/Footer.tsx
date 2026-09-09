import React from 'react';
import { Zap, Heart } from 'lucide-react';

interface FooterProps {
  onOpenHowToPlay: () => void;
  onOpenFeedback: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenHowToPlay,
  onOpenFeedback,
  onOpenTerms,
  onOpenPrivacy,
}) => {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#090b10] py-8 sm:py-12 px-4 text-center">
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-7 rounded-lg bg-pink-500 text-white">
            <Zap className="size-4 fill-white text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">Stormio</span>
          <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300">
            Taboo Online
          </span>
        </div>

        <p className="text-xs text-zinc-400 max-w-md">
          The classic word-guessing party game played online in your browser. Free, real-time, no downloads required.
        </p>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-medium">
          <button
            type="button"
            onClick={onOpenHowToPlay}
            className="hover:text-pink-400 transition-colors cursor-pointer"
          >
            How to Play
          </button>
          <button
            type="button"
            onClick={onOpenFeedback}
            className="hover:text-pink-400 transition-colors cursor-pointer"
          >
            Send Feedback
          </button>
          <button
            type="button"
            onClick={onOpenTerms}
            className="hover:text-pink-400 transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-pink-400 transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>

        <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-2">
          <span>Made with</span>
          <Heart className="size-3 text-pink-500 fill-pink-500 inline" />
          <span>for game night lovers everywhere. Taboo is a registered trademark of Hasbro.</span>
        </div>
      </div>
    </footer>
  );
};
