'use client';
import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Brain, Clock, Tag } from 'lucide-react';
import { aiApi } from '@/lib/api';

interface Props {
  title: string;
  content: string;
  existingSummary?: string;
  existingSentiment?: string;
}

const sentimentColors: Record<string, string> = {
  POSITIVE: '#27AE60',
  NEUTRAL:  '#8b949e',
  NEGATIVE: '#E74C3C',
};

const sentimentEmoji: Record<string, string> = {
  POSITIVE: '😊',
  NEUTRAL:  '😐',
  NEGATIVE: '😤',
};

export default function AISummaryCard({ title, content, existingSummary, existingSentiment }: Props) {
  const [expanded, setExpanded]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [summary, setSummary]       = useState(existingSummary || '');
  const [sentiment, setSentiment]   = useState(existingSentiment || '');
  const [topics, setTopics]         = useState<string[]>([]);
  const [readingTime, setReadingTime] = useState('');
  const [toxicity, setToxicity]     = useState(0);
  const [fetched, setFetched]       = useState(!!existingSummary);

  const fetchSummary = async () => {
    if (fetched || loading) { setExpanded(!expanded); return; }
    setLoading(true);
    setExpanded(true);
    try {
      const text = `${title}\n\n${content || ''}`;
      const res = await aiApi.summarize(text);
      const d = res.data;
      setSummary(d.summary);
      setSentiment(d.sentiment);
      setTopics(d.keyTopics || []);
      setReadingTime(d.readingTime || '');
      setToxicity(d.toxicityScore || 0);
      setFetched(true);
    } catch {
      setSummary('Could not generate summary. Try again later.');
    } finally { setLoading(false); }
  };

  const sentColor = sentimentColors[sentiment] || '#8b949e';
  const contentLen = (content || '').length;
  if (contentLen < 150 && !existingSummary) return null;

  return (
    <div className="mt-3 rounded-xl border border-[#30363d] overflow-hidden">
      <button
        onClick={fetchSummary}
        className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500/10 to-[#f97316]/10 hover:from-purple-500/20 hover:to-[#f97316]/20 transition-all text-left"
      >
        <Sparkles size={14} className="text-purple-400 flex-shrink-0" />
        <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-[#f97316] bg-clip-text text-transparent flex-1">
          AI Summary
        </span>
        {sentiment && (
          <span className="text-xs font-bold" style={{ color: sentColor }}>
            {sentimentEmoji[sentiment]} {sentiment}
          </span>
        )}
        {loading ? (
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        ) : expanded ? <ChevronUp size={14} className="text-[#8b949e]" /> : <ChevronDown size={14} className="text-[#8b949e]" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 bg-[#0d1117]/50 space-y-3">
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-4 rounded ai-shimmer" style={{ width: `${70 + i * 8}%` }} />
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-[#e6edf3] leading-relaxed">{summary}</p>
              <div className="flex flex-wrap gap-2">
                {topics.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                    <Tag size={9} /> {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-[#8b949e]">
                {readingTime && (
                  <span className="flex items-center gap-1"><Clock size={11} /> {readingTime}</span>
                )}
                {sentiment && (
                  <span className="flex items-center gap-1">
                    <Brain size={11} />
                    Sentiment: <span style={{ color: sentColor }} className="font-semibold">{sentiment}</span>
                  </span>
                )}
                {toxicity > 0.3 && (
                  <span className="text-yellow-500 font-semibold">
                    ⚠️ Toxicity: {Math.round(toxicity * 100)}%
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
