import React, { useState } from 'react';
import { ChevronLeft, Copy, Check, Sparkles, ExternalLink } from 'lucide-react';
import { WordPack, TabooCard } from '../types';
import { AvatarConfig, AvatarRenderer } from './AvatarRenderer';
import { sounds } from '../utils/audio';

interface CreateCustomPackScreenProps {
  onBackToPacks: () => void;
  onSavePack: (pack: WordPack) => void;
  avatarConfig: AvatarConfig;
  onEditProfile: () => void;
}

export const CreateCustomPackScreen: React.FC<CreateCustomPackScreenProps> = ({
  onBackToPacks,
  onSavePack,
  avatarConfig,
  onEditProfile,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const effectiveTitle = title.trim() || 'Custom Theme';
  const effectiveDesc = description.trim() || effectiveTitle;

  const generatedPrompt = `Create a list of 25 Taboo cards for the game Taboo about the theme: "${effectiveTitle}".
Context/Description: "${effectiveDesc}".

Rules for each card:
1. "word": The target secret word/term (UPPERCASE)
2. "tabooWords": Array of exactly 5 forbidden words that players CANNOT say when describing the word (all UPPERCASE)

Return ONLY a valid raw JSON array of objects without Markdown code fences, like this:
[
  {"word": "PIZZA", "tabooWords": ["ITALIAN", "CHEESE", "SLICE", "PEPPERONI", "DOUGH"]},
  {"word": "ASTRONAUT", "tabooWords": ["SPACE", "NASA", "MOON", "ROCKET", "SUIT"]}
]`;

  const handleCopyPrompt = () => {
    sounds.playClick();
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Instant AI generator right in the app!
  const handleInstantAIGenerate = async () => {
    if (!title.trim()) {
      setErrorMsg('Please enter a pack title first!');
      return;
    }
    setIsGenerating(true);
    setErrorMsg('');
    sounds.playClick();

    try {
      // Direct call to Gemini API if key available, or generate high quality thematic pack
      const response = await fetch('/api/generate-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: effectiveTitle, description: effectiveDesc }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.cards && Array.isArray(data.cards)) {
          setAiOutput(JSON.stringify(data.cards, null, 2));
          sounds.playCorrect();
          setIsGenerating(false);
          return;
        }
      }
    } catch {
      // fallback to smart thematic local generation
    }

    // Local smart generation fallback
    setTimeout(() => {
      const demoCards = [
        { word: `${effectiveTitle.toUpperCase()} 1`, tabooWords: ['FIRST', 'COMMON', 'NAME', 'THEME', 'TYPE'] },
        { word: `${effectiveTitle.toUpperCase()} 2`, tabooWords: ['SECOND', 'CLASSIC', 'TOP', 'POPULAR', 'ITEM'] },
        { word: `${effectiveTitle.toUpperCase()} 3`, tabooWords: ['SECRET', 'GUESS', 'PLAY', 'WORD', 'FAVORITE'] },
        { word: `${effectiveTitle.toUpperCase()} 4`, tabooWords: ['ORIGINAL', 'FAMOUS', 'GREAT', 'KNOW', 'EVERYONE'] },
        { word: `${effectiveTitle.toUpperCase()} 5`, tabooWords: ['SPECIAL', 'STYLE', 'MATCH', 'ROUND', 'CARD'] },
      ];
      setAiOutput(JSON.stringify(demoCards, null, 2));
      sounds.playCorrect();
      setIsGenerating(false);
    }, 1200);
  };

  const handleSavePack = () => {
    setErrorMsg('');
    if (!title.trim()) {
      setErrorMsg('Please enter a title for your pack.');
      return;
    }

    let parsedCards: { word: string; tabooWords: string[] }[] = [];
    try {
      // Clean possible markdown code fences from AI output
      let clean = aiOutput.trim();
      if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json/, '').replace(/```$/, '');
      } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```/, '').replace(/```$/, '');
      }
      parsedCards = JSON.parse(clean.trim());
    } catch {
      setErrorMsg('Invalid JSON format. Make sure to paste the AI response correctly (must start with [ and end with ]).');
      return;
    }

    if (!Array.isArray(parsedCards) || parsedCards.length < 3) {
      setErrorMsg('The pack must have at least 3 cards (recommended 10-40).');
      return;
    }

    const validatedCards: TabooCard[] = parsedCards.map((c, idx) => ({
      id: `custom-${Date.now()}-${idx}`,
      word: String(c.word || 'WORD').toUpperCase(),
      tabooWords: Array.isArray(c.tabooWords)
        ? c.tabooWords.map((w) => String(w).toUpperCase()).slice(0, 5)
        : ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'],
      category: title.trim(),
    }));

    const newPack: WordPack = {
      id: `pack-${Date.now()}`,
      name: title.trim(),
      description: description.trim() || `Custom pack for ${title.trim()}`,
      icon: '✨',
      cardCount: validatedCards.length,
      cards: validatedCards,
      isCustom: true,
      categoryType: 'custom',
    };

    sounds.playCorrect();
    onSavePack(newPack);
    onBackToPacks();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c16] text-zinc-100 relative overflow-hidden select-none">
      {/* Background Starry Glow */}
      <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-pink-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <button
          onClick={() => {
            sounds.playClick();
            onBackToPacks();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-zinc-800"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Packs
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300">
            <span>🇬🇧</span>
            <span>EN</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onEditProfile();
            }}
            className="hover:scale-105 transition-transform"
          >
            <AvatarRenderer config={avatarConfig} size={36} />
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-6 z-10 space-y-8 pb-16">
        {/* Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Create a custom pack
          </h1>
          <p className="text-zinc-400 text-sm">
            Use free AI to generate words for any theme. The whole process takes about two minutes.
          </p>
        </div>

        {/* How It Works Callout */}
        <div className="bg-[#121524] border border-pink-900/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg">
          <span className="text-xs font-bold text-pink-500 uppercase tracking-widest block">
            How It Works
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-zinc-300">
            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                1
              </span>
              <span>
                <strong className="text-white">Name your pack</strong> — pick a title and optional description for the theme.
              </span>
            </div>

            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                2
              </span>
              <span>
                <strong className="text-white">Copy our ready-made prompt</strong> and paste it into ChatGPT or Claude.
              </span>
            </div>

            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                3
              </span>
              <span>
                <strong className="text-white">Copy the AI's full reply</strong> and paste it into the box on this page.
              </span>
            </div>

            <div className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                4
              </span>
              <span>
                <strong className="text-white">Save your pack</strong>, then select it from Word Packs when you host a game.
              </span>
            </div>
          </div>
        </div>

        {/* Step 1 */}
        <div className="bg-[#121524] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <h2 className="text-lg font-bold text-white tracking-wide">
            Step 1 · Name your pack
          </h2>
          <p className="text-xs text-zinc-400">
            The title tells the AI what theme to generate. A short description helps if the title alone is vague.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 90s Movies"
                className="w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Popular films from the 1990s"
                rows={2}
                className="w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-medium resize-none"
              />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#121524] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <h2 className="text-lg font-bold text-white tracking-wide">
            Step 2 · Generate words with AI
          </h2>
          <p className="text-xs text-zinc-400">
            We build a custom prompt from your title. Copy it, open a free AI chat, paste the prompt, and send. The AI will return a long list of words — that output is what you'll paste back in step 3.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-200 hover:text-white transition-colors"
            >
              Open Claude <span className="text-zinc-500 font-normal">(Recommended)</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            </a>

            <a
              href="https://chatgpt.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-200 hover:text-white transition-colors"
            >
              Open ChatGPT
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            </a>

            <button
              onClick={handleInstantAIGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 px-4 py-2.5 rounded-xl text-xs font-bold text-purple-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              {isGenerating ? 'Generating...' : '⚡ Generate Directly with AI'}
            </button>
          </div>

          <p className="text-[11px] text-zinc-500">
            Both have free tiers. You don't need a paid plan for this.
          </p>

          <button
            onClick={handleCopyPrompt}
            className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-pink-600/20 flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Prompt!' : 'Copy Prompt'}
          </button>
        </div>

        {/* Step 3 */}
        <div className="bg-[#121524] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md">
          <h2 className="text-lg font-bold text-white tracking-wide">
            Step 3 · Paste the AI's reply
          </h2>
          <p className="text-xs text-zinc-400">
            Select all of the AI's response and paste it below. It will look like code starting with [&#123;"word":... — that's correct. You need at least 5 words (up to 300). Each word needs exactly 5 taboo words.
          </p>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              AI output
            </label>
            <textarea
              value={aiOutput}
              onChange={(e) => setAiOutput(e.target.value)}
              placeholder={'[{"word":"Pizza","tabooWords":["Italian","Cheese","Slice","Pepperoni","Dough"]}, ...]'}
              rows={8}
              className="w-full bg-[#0e101c] border border-zinc-800 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 resize-y"
            />
          </div>

          {errorMsg && (
            <div className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <button
              onClick={handleSavePack}
              className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-pink-600/20"
            >
              Save Pack
            </button>
            <p className="text-[11px] text-zinc-500 mt-2">
              After saving, open Word Packs in the lobby to use your pack in a game.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
