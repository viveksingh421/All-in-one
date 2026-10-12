import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Music,
  Key,
  Send,
  Play,
  Radio,
  Loader2,
  ExternalLink,
  Disc3,
  HelpCircle,
  Headphones
} from 'lucide-react';

export const GeminiVibeGenerator = () => {
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('aether_gemini_key') || '';
  });
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_vibe_playlist');
      return saved
        ? JSON.parse(saved)
        : [
            {
              title: 'Resonance',
              artist: 'HOME',
              vibe: 'Nostalgic synthwave bliss for deep programming flow',
              youtubeQuery: 'HOME - Resonance',
            },
            {
              title: 'Weightless',
              artist: 'Marconi Union',
              vibe: 'Clinically proven ambient soundscape reducing ambient stress',
              youtubeQuery: 'Marconi Union Weightless',
            },
            {
              title: 'Solaris Memory',
              artist: 'C418',
              vibe: 'Floating zero-gravity chords for intense paper reading',
              youtubeQuery: 'C418 ambient focus music',
            },
          ];
    } catch {
      return [];
    }
  });
  const [showKeyField, setShowKeyField] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Persist API key
  const handleSaveKey = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem('aether_gemini_key', val);
  };

  // Persist playlist
  useEffect(() => {
    try {
      localStorage.setItem('aether_vibe_playlist', JSON.stringify(playlist));
    } catch (e) {
      console.error(e);
    }
  }, [playlist]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setErrorMessage('');
    setLoading(true);

    const effectiveKey = apiKey.trim();

    if (!effectiveKey) {
      // High-quality procedural fallback generator if key isn't provided yet
      setTimeout(() => {
        const fallbacks = [
          {
            title: 'Starry Night Codex',
            artist: 'Lofi Orbit & Chill Beats',
            vibe: `Procedural curated vibe: "${prompt.trim()}" - relaxing celestial cadence.`,
            youtubeQuery: `${prompt.trim()} lofi study beats chill`,
          },
          {
            title: 'Synthetic Aurora',
            artist: 'Solaris Wave',
            vibe: 'Smooth zero-gravity chill synth tones engineered for deep focus.',
            youtubeQuery: `${prompt.trim()} ambient synthwave focus`,
          },
          {
            title: 'Deep Void Study Tape',
            artist: 'Aether Resonance',
            vibe: 'Binaural steady flow state generator without lyrical interference.',
            youtubeQuery: `${prompt.trim()} binaural study soundscape`,
          },
        ];
        setPlaylist(fallbacks);
        setLoading(false);
      }, 700);
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI study music curator for a futuristic zero-gravity workstation. The user wants music with this study vibe/request: "${prompt.trim()}".
Generate a list of 4 to 5 music tracks or chill study vibes.
Respond ONLY with a valid JSON array of objects having these exact keys:
- "title": Track or album title (string)
- "artist": Artist or channel name (string)
- "vibe": A short, elegant 1-sentence description of why this fits the study session (string)
- "youtubeQuery": A search term to find this song on YouTube (e.g. "Artist - Title")

Do not include markdown triple backticks. Return strictly the raw JSON array.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              response_mime_type: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      // Clean possible fences
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setPlaylist(parsed);
      } else {
        throw new Error('Could not parse Gemini music track array.');
      }
    } catch (err) {
      console.error('Gemini API Error:', err);
      setErrorMessage(`Gemini Notice: ${err.message}. Showing procedural curated stream.`);
      // Provide intelligent fallback playlist
      setPlaylist([
        {
          title: 'Celestial Deep Study Tape',
          artist: 'Aether Collective',
          vibe: `Vibe tailored for "${prompt}": Smooth binaural space beats.`,
          youtubeQuery: `${prompt} lofi study beats`,
        },
        {
          title: 'Midnight Coder Flight',
          artist: 'Nebula Sounds',
          vibe: 'Continuous low-frequency pulses keeping cognitive strain minimal.',
          youtubeQuery: `${prompt} deep ambient focus music`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)] relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-1/4 w-80 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Title & Gemini API Key Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-pink-300 shadow-inner">
            <Headphones className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                Gemini AI Music & Study Vibe Generator
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-300">
                gemini-1.5-flash
              </span>
            </div>
            <p className="text-[11px] text-starlight-300/60 font-mono">
              Curate celestial soundtracks and lo-fi vibes tailored to your study task
            </p>
          </div>
        </div>

        {/* API Key Toggle Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyField(!showKeyField)}
            className={`px-4 py-2 rounded-xl text-sm font-mono flex items-center gap-2 transition-all border font-semibold ${
              apiKey
                ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-200'
                : 'bg-space-900/60 border-white/10 text-starlight-300/80 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-cyan-400" />
            <span>{apiKey ? 'API Key Configured' : 'Configure Gemini Key'}</span>
          </button>
        </div>
      </div>

      {/* API Key Drawer (Saved to localStorage) */}
      {showKeyField && (
        <div className="mb-5 p-4 rounded-2xl bg-space-900/70 border border-white/10 animate-in fade-in duration-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-mono text-starlight-200 font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              Gemini API Key (stored locally in browser):
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
            >
              Get free key at Google AI Studio <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={handleSaveKey}
            placeholder="AIzaSy..."
            className="w-full bg-space-950/80 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-cyan-400/50"
          />
          <p className="text-xs text-starlight-300/60 font-mono">
            Key is securely held in your browser's localStorage. Leaving this blank uses intelligent procedural vibe curations.
          </p>
        </div>
      )}

      {/* Prompt Search Bar */}
      <form onSubmit={handleGenerate} className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Late night C++ focus beats, Chill ambient lo-fi for reading papers, or Binaural cosmic drift..."
            className="w-full bg-space-900/70 border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm sm:text-base text-white placeholder-starlight-300/50 focus:outline-none focus:border-pink-400/60 transition-colors font-sans shadow-inner"
          />
          <Sparkles className="w-5 h-5 text-pink-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(244,114,182,0.35)] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Curating Vibe...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Vibe</span>
            </>
          )}
        </button>
      </form>

      {errorMessage && (
        <p className="text-xs font-mono text-amber-300/90 mb-3 px-1">{errorMessage}</p>
      )}

      {/* Playlist Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {playlist.map((track, idx) => (
          <div
            key={idx}
            className="group p-5 rounded-2xl bg-space-900/50 border border-white/10 hover:border-pink-500/40 hover:bg-space-850/80 transition-all duration-300 flex flex-col justify-between shadow-lg"
          >
            <div className="space-y-2 mb-4">
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-300 shrink-0 shadow-inner">
                    <Disc3 className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-pink-200 transition-colors line-clamp-1">
                    {track.title}
                  </h4>
                </div>
                <span className="text-xs font-mono text-starlight-300/60 font-semibold shrink-0">
                  #{idx + 1}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-mono text-purple-300 font-semibold">{track.artist}</p>
              <p className="text-xs sm:text-sm text-starlight-200/90 leading-relaxed line-clamp-3 font-sans">
                {track.vibe}
              </p>
            </div>

            {/* Direct YouTube Search Link */}
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                track.youtubeQuery || `${track.artist} - ${track.title}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-xs sm:text-sm font-mono font-semibold text-starlight-100 hover:text-white border border-white/10 hover:border-rose-500/40 transition-all group/yt cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-4 rounded bg-rose-600 flex items-center justify-center text-white text-[10px] group-hover/yt:scale-110 transition-transform">
                  ▶
                </span>
                <span>Play on YouTube</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-starlight-300/50 group-hover/yt:text-white" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
