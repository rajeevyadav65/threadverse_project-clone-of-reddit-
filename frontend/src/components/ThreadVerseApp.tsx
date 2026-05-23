'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, BookmarkCheck,
  Bell, Search, Plus, Home, Compass, TrendingUp, Award, Moon, Sun,
  X, Image, Link, Type, MoreHorizontal, Flame, ChevronDown, Send,
  Sparkles, Globe, Filter, Crown, Eye, Clock, Gift, Settings, LogOut,
  User, Hash, MessageCircle, Users, Layers, ChevronRight, Trophy,
  Flag, Edit3, Trash2, BarChart2, ExternalLink, Repeat2, Zap, Shield,
  Loader2, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { postApi, communityApi, commentApi, aiApi, awardApi } from '@/lib/api';
import AISummaryCard from '@/components/ai/AISummaryCard';
import toast from 'react-hot-toast';
import Link2 from 'next/link';

// ── THEME ──────────────────────────────────────────────────────────────────────
const T = {
  bg:'#0d1117', surface:'#161b22', card:'#1c2128', border:'#30363d',
  text:'#e6edf3', muted:'#8b949e', accent:'#f97316', accentBg:'rgba(249,115,22,0.12)',
  inputBg:'#0d1117', hover:'#21262d', overlay:'rgba(1,4,9,0.85)'
};

// ── STATIC DATA (used as fallback + for UI) ────────────────────────────────────
const STATIC_COMMUNITIES = [
  { id:1, name:'r/technology',  icon:'💻', members:'14.2M', online:12400, color:'#5865F2', joined:true,  banner:'linear-gradient(135deg,#1a1a3e,#2d1b69)', desc:'The intersection of technology, innovation and culture.', rules:['Be respectful','No spam','Accurate titles'], flairs:['Discussion','News','Question','Tutorial','Project'] },
  { id:2, name:'r/science',     icon:'🔬', members:'28.5M', online:8900,  color:'#2D9CDB', joined:true,  banner:'linear-gradient(135deg,#0a192f,#1a3a5c)', desc:'Science, research, and fascinating discoveries.',       rules:['Peer-reviewed sources','No pseudoscience'],          flairs:['Biology','Physics','Chemistry','Space'] },
  { id:3, name:'r/programming', icon:'⌨️', members:'5.8M',  online:4200,  color:'#27AE60', joined:false, banner:'linear-gradient(135deg,#0d1f0d,#1a3d1a)', desc:'Computer programming discussions.',                    rules:['No beginner questions','Must be programming related'], flairs:['Question','Project','Article'] },
  { id:4, name:'r/worldnews',   icon:'🌍', members:'31.2M', online:21000, color:'#E74C3C', joined:true,  banner:'linear-gradient(135deg,#1a0a0a,#3d1515)', desc:'Major news from around the world.',                    rules:['Reputable sources only','No editorializing'],         flairs:['Breaking','War','Politics','Economy'] },
  { id:5, name:'r/gaming',      icon:'🎮', members:'36.7M', online:18500, color:'#9B59B6', joined:false, banner:'linear-gradient(135deg,#1a0a2e,#2d1b4e)', desc:'A subreddit for gamers.',                             rules:['No unverified news','Spoiler tags required'],         flairs:['Discussion','Review','Clip','News'] },
  { id:6, name:'r/design',      icon:'🎨', members:'3.1M',  online:1800,  color:'#F39C12', joined:false, banner:'linear-gradient(135deg,#1a1500,#3d3000)', desc:'Design for all disciplines.',                         rules:['Constructive criticism only','Credit creators'],      flairs:['UI/UX','Graphic','Typography'] },
  { id:7, name:'r/startups',    icon:'🚀', members:'1.2M',  online:950,   color:'#1ABC9C', joined:false, banner:'linear-gradient(135deg,#001a15,#003d2e)', desc:'Community for startup founders.',                     rules:['No promotion without disclosure'],                    flairs:['Advice','Story','Resources'] },
];
const STATIC_POSTS = [
  { id:1, title:'The Future of Quantum Computing: What 2025 Means for Encryption', content:'Recent breakthroughs in quantum computing have sent shockwaves through the cryptography community. IBM and Google have both announced major milestones that could make current RSA encryption obsolete within a decade.', type:'TEXT', community:'r/technology', communityIcon:'💻', communityColor:'#5865F2', author:'u/QuantumLeap', voteCount:45821, userVote:null, commentCount:1243, awards:[{type:'PLATINUM',icon:'🏆',count:1},{type:'GOLD',icon:'🥇',count:3}], saved:false, timeAgo:'4h ago', flair:'Discussion', pinned:false, viewCount:234500, aiSummary:'Quantum computing milestones by IBM and Google threaten current RSA encryption, prompting urgent development of post-quantum cryptographic standards.', aiSentiment:'NEUTRAL' },
  { id:2, title:'Scientists Discover New Deep-Sea Creature That Produces Its Own Light', content:'', type:'IMAGE', community:'r/science', communityIcon:'🔬', communityColor:'#2D9CDB', author:'u/sciencenerd', voteCount:89230, userVote:'UPVOTE', commentCount:2108, awards:[{type:'GOLD',icon:'🥇',count:7}], saved:true, timeAgo:'7h ago', flair:'Biology', pinned:false, viewCount:891000, imageUrl:'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&q=80', aiSentiment:'POSITIVE' },
  { id:3, title:'[POLL] Preferred backend language for 2025?', content:'Vote and share your reasoning!', type:'POLL', community:'r/programming', communityIcon:'⌨️', communityColor:'#27AE60', author:'u/codesmith', voteCount:12400, userVote:null, commentCount:873, awards:[], saved:false, timeAgo:'12h ago', flair:'Question', pinned:false, viewCount:45200, poll:{ options:[{id:1,text:'Java / Spring Boot',votes:3240,userVoted:false},{id:2,text:'Go',votes:2810,userVoted:false},{id:3,text:'Python / FastAPI',votes:4120,userVoted:false},{id:4,text:'Node.js / TS',votes:1850,userVoted:false},{id:5,text:'Rust',votes:380,userVoted:false}], total:12400, userVoted:false } },
  { id:4, title:'Major breach: 3 billion records exposed in largest data leak of 2025', content:'A massive cybersecurity incident has compromised personal data from over 3 billion users across multiple platforms. Security researchers discovered the breach on a dark web forum.', type:'TEXT', community:'r/worldnews', communityIcon:'🌍', communityColor:'#E74C3C', author:'u/securitywatch', voteCount:132000, userVote:null, commentCount:5621, awards:[{type:'PLATINUM',icon:'🏆',count:3}], saved:false, timeAgo:'2h ago', flair:'Breaking', pinned:true, viewCount:2100000, aiSentiment:'NEGATIVE' },
  { id:5, title:'I built an AI code reviewer that saved my team 40% review time', content:'After months of development we are excited to share our internal tool. The system uses a fine-tuned model that understands codebase context and flags architectural anti-patterns.', type:'LINK', community:'r/programming', communityIcon:'⌨️', communityColor:'#27AE60', author:'u/devmaster99', voteCount:28900, userVote:'UPVOTE', commentCount:634, awards:[{type:'GOLD',icon:'🥇',count:5}], saved:false, timeAgo:'1d ago', flair:'Project', pinned:false, viewCount:178000, linkUrl:'https://github.com', linkDomain:'github.com', aiSentiment:'POSITIVE' },
  { id:6, title:'We reached $1M ARR in 14 months with zero marketing budget — AMA!', content:'Exactly 14 months ago we launched our B2B SaaS with no budget, just two founders. Today we crossed $1M ARR. Answering everything for the next 3 hours.', type:'TEXT', community:'r/startups', communityIcon:'🚀', communityColor:'#1ABC9C', author:'u/founder_stories', voteCount:54200, userVote:null, commentCount:1892, awards:[{type:'PLATINUM',icon:'🏆',count:2},{type:'ROCKET',icon:'🚀',count:6}], saved:false, timeAgo:'6h ago', flair:'Story', pinned:true, viewCount:412000, aiSentiment:'POSITIVE' },
];
const AWARDS_LIST = [
  { id:'SILVER',    name:'Silver',    icon:'🥈', cost:100,  desc:'Shows you liked it' },
  { id:'GOLD',      name:'Gold',      icon:'🥇', cost:500,  desc:'Gives Premium & coins' },
  { id:'PLATINUM',  name:'Platinum',  icon:'🏆', cost:1800, desc:'Best award on the site' },
  { id:'HELPFUL',   name:'Helpful',   icon:'🤝', cost:200,  desc:'Thank them for helping' },
  { id:'WHOLESOME', name:'Wholesome', icon:'💛', cost:125,  desc:'Spread the warmth' },
  { id:'ROCKET',    name:'Rocket',    icon:'🚀', cost:300,  desc:'Propel to the moon' },
];
const TRENDING = [
  { tag:'QuantumComputing', posts:'2.4k posts' },
  { tag:'AIRegulation',     posts:'8.1k posts' },
  { tag:'DataBreach2025',   posts:'15k posts'  },
  { tag:'OpenSourceAI',     posts:'3.2k posts' },
  { tag:'WebAssembly',      posts:'1.1k posts' },
];

// ── HELPERS ────────────────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n);
const sentimentColor: Record<string, string> = { POSITIVE:'#27AE60', NEUTRAL:'#8b949e', NEGATIVE:'#E74C3C' };
const sentimentEmoji: Record<string, string> = { POSITIVE:'😊', NEUTRAL:'😐', NEGATIVE:'😤' };

// ── SMALL COMPONENTS ───────────────────────────────────────────────────────────
const communityIndex = Object.fromEntries(
  STATIC_COMMUNITIES.map(community => [community.name.replace('r/', ''), community])
);

const timeAgoFrom = (value?: string) => {
  if (!value) return 'recently';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'recently';
  const minutes = Math.max(1, Math.floor((Date.now() - parsed.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const normalizePost = (post: any) => {
  const rawCommunity = typeof post.community === 'string'
    ? post.community
    : post.community?.name || post.communityName || '';
  const communityKey = rawCommunity.replace(/^r\//, '');
  const communityMeta = communityIndex[communityKey];
  const rawAuthor = typeof post.author === 'string'
    ? post.author
    : post.author?.username || post.authorUsername || '';
  const pollOptions = Array.isArray(post.poll?.options)
    ? post.poll.options
    : Array.isArray(post.pollOptions)
      ? post.pollOptions
      : [];

  return {
    ...post,
    community: communityKey ? `r/${communityKey}` : communityMeta?.name,
    communityIcon: post.communityIcon || post.community?.icon || communityMeta?.icon,
    communityColor: post.communityColor || post.community?.themeColor || communityMeta?.color,
    author: rawAuthor ? (rawAuthor.startsWith('u/') ? rawAuthor : `u/${rawAuthor}`) : 'u/unknown',
    awards: Array.isArray(post.awards) ? post.awards : [],
    saved: !!post.saved,
    pinned: post.pinned ?? post.isPinned ?? false,
    timeAgo: post.timeAgo || timeAgoFrom(post.createdAt),
    poll: pollOptions.length > 0 ? {
      options: pollOptions.map((option: any) => ({
        id: option.id,
        text: option.text,
        votes: option.votes || 0,
        userVoted: !!option.userVoted,
      })),
      total: pollOptions.reduce((sum: number, option: any) => sum + Number(option.votes || 0), 0),
      userVoted: pollOptions.some((option: any) => option.userVoted),
    } : post.poll,
  };
};

const normalizeComment = (comment: any): any => ({
  ...comment,
  author: comment.author || (comment.authorUsername ? `u/${comment.authorUsername}` : 'u/unknown'),
  avatarColor: comment.avatarColor || '#8b949e',
  timeAgo: comment.timeAgo || timeAgoFrom(comment.createdAt),
  replies: Array.isArray(comment.replies) ? comment.replies.map(normalizeComment) : [],
});

function Avatar({ name, size=32, color='#F97316' }: { name:string; size?:number; color?:string }) {
  const initials = name.replace('u/','').replace('r/','').slice(0,2).toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.35, fontWeight:700, color:'#fff', flexShrink:0, fontFamily:'monospace' }}>
      {initials}
    </div>
  );
}

function ActionBtn({ icon, label, onClick, active }: { icon:React.ReactNode; label:string; onClick?:()=>void; active?:boolean }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 9px', background:'none', border:'none', cursor:'pointer', color:active?T.accent:T.muted, fontSize:13, fontWeight:500, borderRadius:4, transition:'all 0.15s' }}
      onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background=T.hover; (e.currentTarget as HTMLElement).style.color=T.text; }}
      onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='none'; (e.currentTarget as HTMLElement).style.color=active?T.accent:T.muted; }}>
      {icon}{label}
    </button>
  );
}

function VoteBox({ votes, userVote, onVote, vertical=true }: { votes:number; userVote:string|null; onVote:(d:string)=>void; vertical?:boolean }) {
  const up = userVote === 'UPVOTE', down = userVote === 'DOWNVOTE';
  const count = votes + (up ? 1 : down ? -1 : 0);
  const base = { background:'none', border:'none', cursor:'pointer', borderRadius:4, padding:'4px 6px', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' };
  const nodes = [
    <button key="up" onClick={()=>onVote('UPVOTE')} style={{ ...base, color:up?T.accent:T.muted }}><ArrowUp size={18} strokeWidth={2.5} fill={up?T.accent:'none'} /></button>,
    <span key="c" style={{ fontSize:13, fontWeight:700, color:up?T.accent:down?'#5865F2':T.text, transition:'color 0.15s' }}>{fmt(count)}</span>,
    <button key="dn" onClick={()=>onVote('DOWNVOTE')} style={{ ...base, color:down?'#5865F2':T.muted }}><ArrowDown size={18} strokeWidth={2.5} fill={down?'#5865F2':'none'} /></button>,
  ];
  return vertical
    ? <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, minWidth:40 }}>{nodes}</div>
    : <div style={{ display:'flex', alignItems:'center', gap:4 }}>{nodes}</div>;
}

function PollWidget({ poll, postId, onVote }: any) {
  const max = Math.max(...poll.options.map((o:any) => o.votes));
  return (
    <div style={{ marginTop:12, background:T.hover, borderRadius:8, padding:'12px 16px', border:`1px solid ${T.border}` }}>
      {poll.options.map((opt:any, i:number) => {
        const pct = poll.total > 0 ? Math.round((opt.votes/poll.total)*100) : 0;
        const isWinner = opt.votes === max && poll.total > 0;
        return (
          <div key={opt.id||i} onClick={()=>!poll.userVoted && onVote(postId, opt.id||i)} style={{ marginBottom:10, cursor:poll.userVoted?'default':'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:13, color:T.text }}>
              <span style={{ fontWeight:isWinner?600:400 }}>{opt.text}{isWinner && poll.userVoted && <span style={{color:T.accent,marginLeft:6}}>✓</span>}</span>
              <span style={{ color:T.muted, fontWeight:600 }}>{pct}%</span>
            </div>
            <div style={{ height:6, borderRadius:3, background:T.border, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, borderRadius:3, background:opt.userVoted?T.accent:isWinner?'#5865F2':T.muted, transition:'width 0.5s ease' }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize:12, color:T.muted, marginTop:6 }}>{fmt(poll.total)} votes</div>
    </div>
  );
}

// ── POST CARD ──────────────────────────────────────────────────────────────────
function PostCard({ post, onVote, onSave, onPollVote, onOpenPost, onOpenCommunity, onAward }: any) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const comm = STATIC_COMMUNITIES.find(c => c.name === post.community || c.id === post.communityId);

  const handleShare = async () => {
    setSharing(true);
    await navigator.clipboard.writeText(window.location.origin + '/post/' + post.id).catch(()=>{});
    toast.success('Link copied!');
    setTimeout(() => setSharing(false), 1500);
  };

  return (
    <div className="post-card" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, display:'flex', overflow:'hidden', transition:'all 0.2s', cursor:'pointer' }}>
      {/* Vote sidebar */}
      <div style={{ background:T.hover, padding:'8px 6px', display:'flex', flexDirection:'column', alignItems:'center', minWidth:44 }}>
        <VoteBox votes={post.voteCount} userVote={post.userVote} onVote={dir=>onVote(post.id,dir)} />
      </div>
      {/* Body */}
      <div style={{ flex:1, padding:'10px 12px', minWidth:0 }}>
        {/* Meta */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 }}>
          <button onClick={e=>{e.stopPropagation();onOpenCommunity(post.community||comm?.name);}} style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', padding:0 }}>
            <span style={{ fontSize:16 }}>{post.communityIcon || comm?.icon || '📌'}</span>
            <span style={{ color:T.accent, fontWeight:700, fontSize:12 }}>{post.community || comm?.name}</span>
          </button>
          <span style={{ color:T.muted, fontSize:12 }}>• {post.author}</span>
          <span style={{ color:T.muted, fontSize:12 }}>• <Clock size={11} style={{ display:'inline', verticalAlign:'middle' }}/> {post.timeAgo || 'recently'}</span>
          {post.pinned && <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background:'#27AE6022', color:'#27AE60', border:'1px solid #27AE6044' }}>📌 Pinned</span>}
          {post.flair && <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background:(post.communityColor||T.accent)+'22', color:post.communityColor||T.accent, border:`1px solid ${post.communityColor||T.accent}44` }}>{post.flair}</span>}
          {post.aiSentiment && <span style={{ fontSize:11 }}>{sentimentEmoji[post.aiSentiment]}</span>}
          {post.awards?.map((a:any,i:number) => (
            <span key={i} style={{ fontSize:12, display:'flex', alignItems:'center', gap:3, background:'rgba(255,255,255,0.06)', padding:'2px 6px', borderRadius:4 }}>{a.icon} <span style={{ fontWeight:600 }}>{a.count}</span></span>
          ))}
        </div>
        {/* Title */}
        <h3 onClick={()=>onOpenPost(post.id)} style={{ margin:'0 0 8px', fontSize:17, fontWeight:700, color:T.text, lineHeight:1.4, cursor:'pointer', fontFamily:"'Georgia',serif" }}>{post.title}</h3>
        {/* Content */}
        {post.type==='IMAGE' && post.imageUrl && (
          <div onClick={()=>onOpenPost(post.id)} style={{ borderRadius:6, overflow:'hidden', marginBottom:8, maxHeight:300 }}>
            <img src={post.imageUrl} alt="" style={{ width:'100%', objectFit:'cover', maxHeight:300, display:'block' }}/>
          </div>
        )}
        {post.type==='LINK' && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:T.hover, borderRadius:6, padding:'8px 12px', marginBottom:8, border:`1px solid ${T.border}` }}>
            <ExternalLink size={14} color={T.accent}/>
            <span style={{ fontSize:12, color:T.accent, fontWeight:500 }}>{post.linkDomain}</span>
          </div>
        )}
        {post.type==='TEXT' && post.content && (
          <p onClick={()=>onOpenPost(post.id)} style={{ margin:'0 0 8px', fontSize:14, color:T.muted, lineHeight:1.6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical' } as any}>
            {post.content}
          </p>
        )}
        {post.type==='POLL' && post.poll && <PollWidget poll={post.poll} postId={post.id} onVote={onPollVote}/>}
        {/* AI Summary */}
        {post.type==='TEXT' && post.content && post.content.length > 150 && (
          <AISummaryCard title={post.title} content={post.content} existingSummary={post.aiSummary} existingSentiment={post.aiSentiment}/>
        )}
        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:2, flexWrap:'wrap', marginTop:8 }}>
          <ActionBtn icon={<MessageSquare size={14}/>} label={`${fmt(post.commentCount)} Comments`} onClick={()=>onOpenPost(post.id)}/>
          <ActionBtn icon={sharing ? <Loader2 size={14} className="animate-spin"/> : <Share2 size={14}/>} label="Share" onClick={handleShare}/>
          <ActionBtn icon={<Repeat2 size={14}/>} label="Crosspost"/>
          <ActionBtn icon={post.saved ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>} label={post.saved?'Saved':'Save'} onClick={()=>onSave(post.id)} active={post.saved}/>
          <ActionBtn icon={<Gift size={14}/>} label="Award" onClick={()=>onAward(post.id)}/>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ display:'flex', alignItems:'center', gap:3, color:T.muted, fontSize:12 }}><Eye size={11}/>{fmt(post.viewCount||0)}</span>
            <div style={{ position:'relative' }}>
              <ActionBtn icon={<MoreHorizontal size={14}/>} label="" onClick={()=>setMenuOpen(!menuOpen)}/>
              {menuOpen && (
                <div style={{ position:'absolute', right:0, top:'100%', background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, zIndex:50, minWidth:130, padding:4, boxShadow:'0 8px 24px rgba(0,0,0,0.5)' }}>
                  {[{icon:<Flag size={13}/>,label:'Report'},{icon:<Eye size={13}/>,label:'Hide'},{icon:<Trash2 size={13}/>,label:'Delete'}].map(item=>(
                    <button key={item.label} onClick={()=>setMenuOpen(false)} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 12px', background:'none', border:'none', cursor:'pointer', color:T.muted, fontSize:13, borderRadius:4 }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background=T.hover} onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='none'}>
                      {item.icon}{item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CREATE POST MODAL ─────────────────────────────────────────────────────────
function CreatePostModal({ onClose, onPost, communities }: any) {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('TEXT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [community, setCommunity] = useState(communities[0]?.name||'');
  const [flair, setFlair] = useState('');
  const [loading, setLoading] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [modResult, setModResult] = useState<any>(null);
  const comm = communities.find((c:any) => c.name === community);

  const checkModeration = async () => {
    if (!content || content.length < 20) return;
    setModerating(true);
    try {
      const res = await aiApi.moderate(title + ' ' + content);
      setModResult(res.data);
    } catch { /* ignore */ } finally { setModerating(false); }
  };

  const submit = async () => {
    if (!title.trim() || !isAuthenticated) return;
    setLoading(true);
    try {
      await postApi.createPost({ title, content, type:tab, communityName:community.replace('r/',''), flair, isNsfw:false, isSpoiler:false, isOC:false });
      toast.success('Post created!');
      onPost();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create post');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:T.overlay, zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'40px 16px' }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{ background:T.surface, borderRadius:12, width:'100%', maxWidth:680, border:`1px solid ${T.border}` }}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:T.text }}>Create a Post</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:T.muted }}><X size={18}/></button>
        </div>
        <div style={{ padding:20 }}>
          <select value={community} onChange={e=>setCommunity(e.target.value)} style={{ width:'100%', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', color:T.text, fontSize:14, outline:'none', marginBottom:16 }}>
            {communities.map((c:any) => <option key={c.id||c.name} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
          <div style={{ display:'flex', borderBottom:`1px solid ${T.border}`, marginBottom:16 }}>
            {[{id:'TEXT',icon:<Type size={14}/>},{id:'IMAGE',icon:<Image size={14}/>},{id:'LINK',icon:<Link size={14}/>},{id:'POLL',icon:<BarChart2 size={14}/>}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', background:'none', border:'none', borderBottom:tab===t.id?`2px solid ${T.accent}`:'2px solid transparent', cursor:'pointer', color:tab===t.id?T.accent:T.muted, fontSize:13, fontWeight:tab===t.id?600:400, transition:'all 0.2s' }}>
                {t.icon}{t.id}
              </button>
            ))}
          </div>
          <input value={title} onChange={e=>setTitle(e.target.value.slice(0,300))} placeholder="Title *" maxLength={300}
            style={{ width:'100%', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:'12px 14px', color:T.text, fontSize:15, outline:'none', marginBottom:4, boxSizing:'border-box' as any, fontFamily:'inherit' }}/>
          <div style={{ textAlign:'right', fontSize:11, color:T.muted, marginBottom:12 }}>{title.length}/300</div>
          {tab==='TEXT' && (
            <textarea value={content} onChange={e=>setContent(e.target.value)} onBlur={checkModeration} placeholder="Text (optional)" rows={5}
              style={{ width:'100%', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:'12px 14px', color:T.text, fontSize:14, outline:'none', resize:'vertical', boxSizing:'border-box' as any, fontFamily:'inherit', lineHeight:1.6 }}/>
          )}
          {tab==='LINK' && (
            <input placeholder="Paste a URL" style={{ width:'100%', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:'12px 14px', color:T.text, fontSize:14, outline:'none', boxSizing:'border-box' as any }}/>
          )}
          {/* AI moderation badge */}
          {moderating && <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:T.muted, marginTop:8 }}><Loader2 size={12} className="animate-spin"/> AI checking content…</div>}
          {modResult && (
            <div style={{ marginTop:8, padding:'8px 12px', borderRadius:8, background: modResult.flagged ? '#E74C3C22' : '#27AE6022', border:`1px solid ${modResult.flagged?'#E74C3C44':'#27AE6044'}`, fontSize:12, color:modResult.flagged?'#E74C3C':'#27AE60' }}>
              {modResult.flagged ? `⚠️ AI flagged: ${modResult.reason}` : '✅ AI moderation: Content looks good'}
            </div>
          )}
          {/* Flairs */}
          {comm?.flairs?.length > 0 && (
            <div style={{ marginTop:12, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:12, color:T.muted }}>Flair:</span>
              {comm.flairs.map((f:string)=>(
                <button key={f} onClick={()=>setFlair(flair===f?'':f)} style={{ padding:'3px 10px', borderRadius:12, border:`1px solid ${flair===f?T.accent:T.border}`, background:flair===f?T.accentBg:'none', color:flair===f?T.accent:T.muted, fontSize:12, cursor:'pointer' }}>{f}</button>
              ))}
            </div>
          )}
          <div style={{ marginTop:20, display:'flex', justifyContent:'flex-end', gap:10 }}>
            <button onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:`1px solid ${T.border}`, background:'none', color:T.text, fontSize:14, fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={!title.trim() || loading} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:title.trim()?T.accent:T.muted, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6, opacity:title.trim()?1:0.5 }}>
              {loading && <Loader2 size={14} className="animate-spin"/>}Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── AWARD MODAL ───────────────────────────────────────────────────────────────
function AwardModal({ postId, onClose }: { postId:number; onClose:()=>void }) {
  const { isAuthenticated } = useAuth();
  const give = async (type: string) => {
    if (!isAuthenticated) { toast.error('Sign in to give awards'); return; }
    try {
      await awardApi.give(postId, type);
      toast.success(`${type} award given! 🎉`);
    } catch { toast.error('Could not give award'); }
    onClose();
  };
  return (
    <div style={{ position:'fixed', inset:0, background:T.overlay, zIndex:300, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={onClose}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:24, width:360, maxWidth:'90vw' }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:T.text }}>Give an Award 🏅</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:T.muted }}><X size={16}/></button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {AWARDS_LIST.map(aw=>(
            <button key={aw.id} onClick={()=>give(aw.id)} style={{ padding:12, background:T.hover, border:`1px solid ${T.border}`, borderRadius:8, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.accent;(e.currentTarget as HTMLElement).style.background=T.accentBg;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.border;(e.currentTarget as HTMLElement).style.background=T.hover;}}>
              <div style={{ fontSize:24, marginBottom:4 }}>{aw.icon}</div>
              <div style={{ fontWeight:600, color:T.text, fontSize:13 }}>{aw.name}</div>
              <div style={{ color:T.muted, fontSize:11, marginBottom:4 }}>{aw.desc}</div>
              <div style={{ color:T.accent, fontSize:12, fontWeight:700 }}>🪙 {aw.cost}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function ThreadVerseApp() {
  const { user, isAuthenticated, logout } = useAuth();
  const [posts, setPosts] = useState<any[]>(STATIC_POSTS as any[]);
  const [communities] = useState<any[]>(STATIC_COMMUNITIES as any[]);
  const [page, setPage] = useState<'home'|'community'|'post'|'saved'|'profile'|'explore'>('home');
  const [selectedCommunity, setSelectedCommunity] = useState<string|null>(null);
  const [selectedPostId, setSelectedPostId] = useState<number|null>(null);
  const [sortBy, setSortBy] = useState('hot');
  const [showCreate, setShowCreate] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [awardPostId, setAwardPostId] = useState<number|null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedLoading, setFeedLoading] = useState(false);

  // Try to load real data from backend
  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const res = await postApi.getFeed(0, 20, sortBy);
      if (Array.isArray(res.data?.content) && res.data.content.length > 0) {
        setPosts(res.data.content.map(normalizePost));
      }
    } catch { /* use static data */ } finally { setFeedLoading(false); }
  }, [sortBy]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const onVote = async (postId: number, dir: string) => {
    if (!isAuthenticated) { toast.error('Sign in to vote'); return; }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, userVote: p.userVote === dir ? null : dir } : p));
    try { await postApi.vote(postId, dir as any); } catch { loadFeed(); }
  };

  const onSave = async (postId: number) => {
    if (!isAuthenticated) { toast.error('Sign in to save posts'); return; }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
    toast.success('Saved!');
  };

  const onPollVote = (postId: number, optId: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !(p as any).poll || (p as any).poll.userVoted) return p;
      const poll = (p as any).poll;
      const newOpts = poll.options.map((o: any) => o.id === optId ? { ...o, votes: o.votes+1, userVoted:true } : o);
      return { ...p, poll: { ...poll, options:newOpts, total:poll.total+1, userVoted:true } };
    }));
  };

  const onOpenPost = (id: number) => { setSelectedPostId(id); setPage('post'); postApi.recordView(id).catch(()=>{}); };
  const onOpenCommunity = (name: string) => { setSelectedCommunity(name); setPage('community'); };
  const navTo = (pg: any) => { setPage(pg); setSelectedCommunity(null); setSelectedPostId(null); };
  const selectedPost = posts.find(p => p.id === selectedPostId);
  const comm = selectedCommunity ? communities.find(c => c.name === selectedCommunity) : null;

  const sorts = [
    {id:'hot',icon:<Flame size={15}/>,label:'Hot'},
    {id:'new',icon:<Zap size={15}/>,label:'New'},
    {id:'top',icon:<TrendingUp size={15}/>,label:'Top'},
    {id:'rising',icon:<ArrowUp size={15}/>,label:'Rising'},
  ];

  const sortedPosts = [...posts].sort((a,b) => {
    if (sortBy === 'new') return 0;
    return (b as any).voteCount - (a as any).voteCount;
  });

  const communityPosts = sortedPosts.filter(p => p.community === selectedCommunity);
  const savedPosts = posts.filter(p => (p as any).saved);

  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:'system-ui,-apple-system,sans-serif', color:T.text }}>
      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header style={{ position:'sticky', top:0, zIndex:50, height:56, background:T.surface, borderBottom:`1px solid ${T.border}`, display:'flex', alignItems:'center', padding:'0 16px', gap:12 }}>
        <button onClick={()=>navTo('home')} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:T.accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Layers size={18} color="#fff"/>
          </div>
          <span style={{ fontWeight:800, fontSize:18, color:T.text, letterSpacing:'-0.5px' }}>Thread<span style={{ color:T.accent }}>Verse</span></span>
        </button>
        <div style={{ flex:1, maxWidth:480, position:'relative' }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:T.muted }}/>
          <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search communities, posts…" style={{ width:'100%', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:24, padding:'8px 16px 8px 36px', color:T.text, fontSize:14, outline:'none', boxSizing:'border-box' as any }}
            onFocus={e=>(e.target as any).style.borderColor=T.accent} onBlur={e=>(e.target as any).style.borderColor=T.border}/>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
          {/* AI badge */}
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 10px', borderRadius:6, background:'linear-gradient(135deg,rgba(88,101,242,0.2),rgba(249,115,22,0.2))', border:'1px solid rgba(249,115,22,0.3)' }}>
            <Sparkles size={12} className="text-purple-400"/>
            <span style={{ fontSize:11, fontWeight:700, background:'linear-gradient(135deg,#818cf8,#f97316)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>AI Powered</span>
          </div>
          <button onClick={()=>setShowCreate(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:20, border:`1px solid ${T.border}`, background:'none', color:T.text, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e=>{(e.currentTarget as any).style.background=T.accent;(e.currentTarget as any).style.color='#fff';(e.currentTarget as any).style.borderColor=T.accent;}}
            onMouseLeave={e=>{(e.currentTarget as any).style.background='none';(e.currentTarget as any).style.color=T.text;(e.currentTarget as any).style.borderColor=T.border;}}>
            <Plus size={16}/>Create
          </button>
          {isAuthenticated ? (
            <>
              <div style={{ position:'relative' }}>
                <button onClick={()=>{setShowNotif(!showNotif);setShowUserMenu(false);}} style={{ width:36, height:36, borderRadius:8, background:showNotif?T.accentBg:'none', border:`1px solid ${showNotif?T.accent:T.border}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:showNotif?T.accent:T.muted, position:'relative' }}>
                  <Bell size={16}/>
                  <span style={{ position:'absolute', top:6, right:6, width:6, height:6, background:T.accent, borderRadius:'50%', border:`2px solid ${T.surface}` }}/>
                </button>
              </div>
              <div style={{ position:'relative' }}>
                <button onClick={()=>{setShowUserMenu(!showUserMenu);setShowNotif(false);}} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:8, background:'none', border:`1px solid ${T.border}`, cursor:'pointer' }}>
                  <Avatar name={user?.username||'You'} size={28} color={T.accent}/>
                  <span style={{ fontSize:13, fontWeight:600, color:T.text }}>u/{user?.username||'You'}</span>
                  <ChevronDown size={13} color={T.muted}/>
                </button>
                {showUserMenu && (
                  <div style={{ position:'absolute', top:'100%', right:0, marginTop:6, width:200, background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, zIndex:100, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', padding:6 }}>
                    <div style={{ padding:'10px 12px', marginBottom:4, borderBottom:`1px solid ${T.border}` }}>
                      <div style={{ fontWeight:700, fontSize:14, color:T.text }}>u/{user?.username}</div>
                      <div style={{ fontSize:12, color:T.accent }}>⬆ {fmt((user?.postKarma||0)+(user?.commentKarma||0))} karma</div>
                    </div>
                    {[{icon:<User size={14}/>,label:'Profile',action:()=>navTo('profile')},{icon:<Bookmark size={14}/>,label:'Saved',action:()=>navTo('saved')},{icon:<Settings size={14}/>,label:'Settings',action:()=>{}},{icon:<LogOut size={14}/>,label:'Log Out',action:logout,danger:true}].map(item=>(
                      <button key={item.label} onClick={()=>{item.action();setShowUserMenu(false);}} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px', background:'none', border:'none', cursor:'pointer', color:(item as any).danger?'#E74C3C':T.text, fontSize:13, borderRadius:6 }}
                        onMouseEnter={e=>(e.currentTarget as any).style.background=T.hover} onMouseLeave={e=>(e.currentTarget as any).style.background='none'}>
                        {item.icon}{item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display:'flex', gap:8 }}>
              <Link2 href="/auth/login" style={{ padding:'7px 16px', borderRadius:20, border:`1px solid ${T.border}`, background:'none', color:T.text, fontSize:13, fontWeight:600, textDecoration:'none' }}>Log In</Link2>
              <Link2 href="/auth/register" style={{ padding:'7px 16px', borderRadius:20, border:'none', background:T.accent, color:'#fff', fontSize:13, fontWeight:700, textDecoration:'none' }}>Sign Up</Link2>
            </div>
          )}
        </div>
      </header>

      {/* ── LAYOUT ──────────────────────────────────────────────────────────── */}
      <div style={{ display:'flex', maxWidth:1280, margin:'0 auto' }}>
        {/* Left sidebar */}
        <div style={{ width:220, flexShrink:0, position:'sticky', top:56, height:'calc(100vh - 56px)', overflowY:'auto', borderRight:`1px solid ${T.border}`, padding:'12px 8px' }}>
          {[{id:'home',icon:<Home size={17}/>,label:'Home'},{id:'explore',icon:<Compass size={17}/>,label:'Explore'},{id:'saved',icon:<Bookmark size={17}/>,label:'Saved'},{id:'profile',icon:<User size={17}/>,label:'Profile'}].map(item=>(
            <button key={item.id} onClick={()=>navTo(item.id as any)} style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px', borderRadius:8, background:page===item.id?T.accentBg:'none', border:'none', color:page===item.id?T.accent:T.text, fontSize:14, fontWeight:page===item.id?600:400, cursor:'pointer', marginBottom:2, transition:'all 0.2s' }}
              onMouseEnter={e=>{if(page!==item.id)(e.currentTarget as any).style.background=T.hover;}} onMouseLeave={e=>{if(page!==item.id)(e.currentTarget as any).style.background='none';}}>
              {item.icon}{item.label}
            </button>
          ))}
          <div style={{ padding:'12px 12px 6px', borderTop:`1px solid ${T.border}`, marginTop:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:T.muted, letterSpacing:'0.8px', textTransform:'uppercase', marginBottom:6 }}>My Communities</div>
            {communities.filter(c=>c.joined).map(c=>(
              <button key={c.id} onClick={()=>onOpenCommunity(c.name)} style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'7px 10px', borderRadius:6, background:'none', border:'none', color:T.text, fontSize:13, cursor:'pointer' }}
                onMouseEnter={e=>(e.currentTarget as any).style.background=T.hover} onMouseLeave={e=>(e.currentTarget as any).style.background='none'}>
                <span style={{ fontSize:15 }}>{c.icon}</span><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <main style={{ flex:1, padding:'16px', minWidth:0 }}>
          {/* HOME */}
          {page === 'home' && (
            <div>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:'8px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:4 }}>
                {sorts.map(s=>(
                  <button key={s.id} onClick={()=>setSortBy(s.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:6, background:sortBy===s.id?T.accentBg:'none', border:sortBy===s.id?`1px solid ${T.accent}44`:'1px solid transparent', color:sortBy===s.id?T.accent:T.muted, fontSize:14, fontWeight:sortBy===s.id?600:400, cursor:'pointer', transition:'all 0.2s' }}>
                    {s.icon}{s.label}
                  </button>
                ))}
                <button onClick={loadFeed} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, padding:'7px 12px', borderRadius:6, background:'none', border:`1px solid ${T.border}`, color:T.muted, fontSize:13, cursor:'pointer' }}>
                  {feedLoading ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}Refresh
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {sortedPosts.map(post=>(
                  <PostCard key={post.id} post={post} onVote={onVote} onSave={onSave} onPollVote={onPollVote} onOpenPost={onOpenPost} onOpenCommunity={onOpenCommunity} onAward={(id:number)=>setAwardPostId(id)}/>
                ))}
              </div>
            </div>
          )}

          {/* COMMUNITY */}
          {page === 'community' && comm && (
            <div>
              <div style={{ background:comm.banner, borderRadius:8, height:120, marginBottom:-40, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(transparent,rgba(0,0,0,0.6))' }}/>
              </div>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:'50px 20px 20px', marginBottom:12, position:'relative' }}>
                <div style={{ position:'absolute', top:-24, left:20, fontSize:48 }}>{comm.icon}</div>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                  <div>
                    <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:T.text }}>{comm.name}</h1>
                    <p style={{ margin:'4px 0 0', fontSize:13, color:T.muted }}>{comm.members} members</p>
                  </div>
                  <button style={{ padding:'8px 20px', borderRadius:20, border:comm.joined?`1px solid ${T.border}`:'none', background:comm.joined?'none':T.accent, color:comm.joined?T.text:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>{comm.joined?'Joined ✓':'Join'}</button>
                </div>
                <p style={{ margin:'12px 0 0', fontSize:14, color:T.muted }}>{comm.desc}</p>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {communityPosts.map(post=>(
                  <PostCard key={post.id} post={post} onVote={onVote} onSave={onSave} onPollVote={onPollVote} onOpenPost={onOpenPost} onOpenCommunity={onOpenCommunity} onAward={(id:number)=>setAwardPostId(id)}/>
                ))}
                {communityPosts.length === 0 && <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:'60px 20px', textAlign:'center', color:T.muted }}>No posts in this community yet.</div>}
              </div>
            </div>
          )}

          {/* POST DETAIL */}
          {page === 'post' && selectedPost && (
            <PostDetailView post={selectedPost} onVote={onVote} onSave={onSave} onPollVote={onPollVote} onAward={(id:number)=>setAwardPostId(id)}/>
          )}

          {/* SAVED */}
          {page === 'saved' && (
            <div>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:'14px 20px', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
                <Bookmark size={18} color={T.accent}/><span style={{ fontWeight:700, fontSize:16, color:T.text }}>Saved Posts</span>
                <span style={{ background:T.accentBg, color:T.accent, fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:10 }}>{savedPosts.length}</span>
              </div>
              {savedPosts.length === 0 ? (
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:'60px 20px', textAlign:'center' }}>
                  <Bookmark size={48} color={T.muted} style={{ opacity:0.3, marginBottom:12 }}/>
                  <h3 style={{ color:T.text, margin:0, marginBottom:8 }}>No saved posts yet</h3>
                  <p style={{ color:T.muted, fontSize:14, margin:0 }}>Hit Save on any post to find it here.</p>
                </div>
              ) : savedPosts.map(post=>(
                <div key={post.id} style={{ marginBottom:8 }}>
                  <PostCard post={post} onVote={onVote} onSave={onSave} onPollVote={onPollVote} onOpenPost={onOpenPost} onOpenCommunity={onOpenCommunity} onAward={(id:number)=>setAwardPostId(id)}/>
                </div>
              ))}
            </div>
          )}

          {/* EXPLORE */}
          {page === 'explore' && (
            <div>
              <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:'14px 20px', marginBottom:16 }}>
                <h2 style={{ margin:0, fontSize:18, fontWeight:800, color:T.text }}>🔭 Explore Communities</h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
                {communities.map(c=>(
                  <div key={c.id} onClick={()=>onOpenCommunity(c.name)} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, overflow:'hidden', cursor:'pointer', transition:'all 0.2s' }}
                    onMouseEnter={e=>{(e.currentTarget as any).style.borderColor=T.accent;(e.currentTarget as any).style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{(e.currentTarget as any).style.borderColor=T.border;(e.currentTarget as any).style.transform='none';}}>
                    <div style={{ background:c.banner, height:70, display:'flex', alignItems:'flex-end', padding:'8px 14px' }}>
                      <span style={{ fontSize:32 }}>{c.icon}</span>
                    </div>
                    <div style={{ padding:'10px 14px 14px' }}>
                      <div style={{ fontWeight:700, color:T.text, marginBottom:2 }}>{c.name}</div>
                      <div style={{ fontSize:12, color:T.muted, marginBottom:8 }}>{c.members} members</div>
                      <p style={{ fontSize:13, color:T.muted, margin:'0 0 10px', lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' } as any}>{c.desc}</p>
                      <button style={{ padding:'6px 14px', borderRadius:16, border:'none', background:c.joined?T.border:T.accent, color:c.joined?T.text:'#fff', fontSize:12, fontWeight:700, cursor:'pointer' }}>{c.joined?'Joined ✓':'Join'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {page === 'profile' && <ProfileView user={user} posts={sortedPosts.filter((_,i)=>i%3===0)} onVote={onVote} onSave={onSave} onPollVote={onPollVote} onOpenPost={onOpenPost} onOpenCommunity={onOpenCommunity} onAward={(id:number)=>setAwardPostId(id)}/>}
        </main>

        {/* Right sidebar */}
        {page !== 'post' && (
          <aside style={{ width:300, flexShrink:0, padding:'16px 16px 16px 0' }}>
            <RightSidebar comm={comm} communities={communities} onOpenCommunity={onOpenCommunity} onCreatePost={()=>setShowCreate(true)}/>
          </aside>
        )}
      </div>

      {/* MODALS */}
      {showCreate && <CreatePostModal onClose={()=>setShowCreate(false)} onPost={loadFeed} communities={communities}/>}
      {awardPostId && <AwardModal postId={awardPostId} onClose={()=>setAwardPostId(null)}/>}
      {(showNotif||showUserMenu) && <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={()=>{setShowNotif(false);setShowUserMenu(false);}}/>}
    </div>
  );
}

// ── POST DETAIL VIEW ──────────────────────────────────────────────────────────
function PostDetailView({ post, onVote, onSave, onPollVote, onAward }: any) {
  const { isAuthenticated } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const comm = STATIC_COMMUNITIES.find(c => c.name === post.community);

  useEffect(() => {
    commentApi.getByPost(post.id).then(res => {
      if (Array.isArray(res.data)) {
        setComments(res.data.map(normalizeComment));
        return;
      }
      setComments([]);
    }).catch(() => setComments([
      { id:1, author:'u/cryptoExpert', avatarColor:'#5865F2', content:'This is a fascinating development. The implications for TLS, SSH, and basically all secure protocols are massive.', voteCount:4521, userVote:null, timeAgo:'3h ago', replies:[
        { id:2, author:'u/devmaster99', avatarColor:'#F97316', content:'Exactly — CRYSTALS-Kyber is already being rolled into some systems. The real challenge is migration for legacy infrastructure.', voteCount:1234, userVote:null, timeAgo:'3h ago', replies:[] }
      ]},
      { id:3, author:'u/techwhiz', avatarColor:'#27AE60', content:'Financial institutions are already quietly migrating. The compliance deadline they are targeting is 2027.', voteCount:1876, userVote:null, timeAgo:'2h ago', replies:[] }
    ]));
  }, [post.id]);

  const submitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;
    try {
      await commentApi.create(post.id, { content: newComment });
      setComments(prev => [{ id:Date.now(), author:'u/You', avatarColor:T.accent, content:newComment, voteCount:1, userVote:'UPVOTE', timeAgo:'just now', replies:[] }, ...prev]);
      setNewComment('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed to post comment'); }
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, fontSize:13, color:T.muted }}>
        <span style={{ fontSize:16 }}>{comm?.icon}</span>
        <span style={{ color:T.accent, fontWeight:600 }}>{comm?.name}</span>
        <ChevronRight size={12}/>
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.title.slice(0,50)}…</span>
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, overflow:'hidden', marginBottom:12 }}>
        <div style={{ display:'flex' }}>
          <div style={{ background:T.hover, padding:'12px 8px', minWidth:50 }}>
            <VoteBox votes={post.voteCount} userVote={post.userVote} onVote={dir=>onVote(post.id,dir)}/>
          </div>
          <div style={{ flex:1, padding:'16px 20px' }}>
            {post.flair && <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:4, background:T.accentBg, color:T.accent, border:`1px solid ${T.accent}44` }}>{post.flair}</span>}
            <h1 style={{ margin:'10px 0 12px', fontSize:21, fontWeight:800, color:T.text, lineHeight:1.4, fontFamily:"'Georgia',serif" }}>{post.title}</h1>
            {post.type==='IMAGE' && post.imageUrl && <img src={post.imageUrl} alt="" style={{ width:'100%', borderRadius:8, marginBottom:14 }}/>}
            {post.type==='LINK' && <div style={{ display:'flex', alignItems:'center', gap:8, background:T.hover, borderRadius:8, padding:'12px 16px', marginBottom:14, border:`1px solid ${T.border}` }}><ExternalLink size={16} color={T.accent}/><a href={post.linkUrl||'#'} target="_blank" rel="noreferrer" style={{ color:T.accent, fontSize:14, textDecoration:'none' }}>{post.linkUrl}</a></div>}
            {post.content && <p style={{ margin:'0 0 14px', fontSize:15, color:T.text, lineHeight:1.8 }}>{post.content}</p>}
            {post.type==='POLL' && post.poll && <PollWidget poll={post.poll} postId={post.id} onVote={onPollVote}/>}
            {post.type==='TEXT' && post.content && post.content.length > 100 && <AISummaryCard title={post.title} content={post.content} existingSummary={post.aiSummary} existingSentiment={post.aiSentiment}/>}
            <div style={{ display:'flex', gap:2, flexWrap:'wrap', marginTop:12, paddingTop:12, borderTop:`1px solid ${T.border}` }}>
              <ActionBtn icon={<Share2 size={14}/>} label="Share"/>
              <ActionBtn icon={post.saved?<BookmarkCheck size={14}/>:<Bookmark size={14}/>} label={post.saved?'Saved':'Save'} onClick={()=>onSave(post.id)} active={post.saved}/>
              <ActionBtn icon={<Gift size={14}/>} label="Award" onClick={()=>onAward(post.id)}/>
            </div>
          </div>
        </div>
      </div>
      {/* Comment box */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:'16px 20px', marginBottom:12 }}>
        <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder={isAuthenticated ? "Share your thoughts…" : "Sign in to comment"} rows={3} disabled={!isAuthenticated}
          style={{ width:'100%', background:T.inputBg, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', color:T.text, fontSize:14, resize:'vertical', outline:'none', fontFamily:'inherit', lineHeight:1.6, boxSizing:'border-box' as any }}
          onFocus={e=>(e.target as any).style.borderColor=T.accent} onBlur={e=>(e.target as any).style.borderColor=T.border}/>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
          <button onClick={submitComment} disabled={!newComment.trim()||!isAuthenticated} style={{ padding:'7px 16px', borderRadius:6, border:'none', background:newComment.trim()&&isAuthenticated?T.accent:T.muted, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:newComment.trim()&&isAuthenticated?1:0.5 }}>
            Comment
          </button>
        </div>
      </div>
      {/* Comments */}
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:'16px 20px' }}>
        {comments.map(c=>(
          <CommentItem key={c.id} comment={c} depth={0}/>
        ))}
      </div>
    </div>
  );
}

function CommentItem({ comment, depth }: any) {
  const [collapsed, setCollapsed] = useState(false);
  const colors = ['#5865F2','#27AE60','#E74C3C','#F39C12','#9B59B6'];
  const barColor = colors[depth % colors.length];
  return (
    <div style={{ marginLeft:depth>0?20:0, borderLeft:depth>0?`2px solid ${barColor}33`:'none', paddingLeft:depth>0?12:0, marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor:'pointer' }} onClick={()=>setCollapsed(!collapsed)}>
        <Avatar name={comment.author} size={24} color={comment.avatarColor||'#8b949e'}/>
        <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{comment.author}</span>
        <span style={{ fontSize:12, color:T.muted }}>{comment.timeAgo}</span>
        {comment.aiSentiment && <span style={{ fontSize:11 }}>{sentimentEmoji[comment.aiSentiment]}</span>}
      </div>
      {!collapsed && (
        <>
          <p style={{ margin:'0 0 8px 32px', fontSize:14, color:T.text, lineHeight:1.7 }}>{comment.content}</p>
          <div style={{ display:'flex', alignItems:'center', gap:2, marginLeft:32, marginBottom:4 }}>
            <VoteBox votes={comment.voteCount} userVote={comment.userVote} onVote={()=>{}} vertical={false}/>
            <ActionBtn icon={<MessageSquare size={12}/>} label="Reply"/>
            <ActionBtn icon={<Flag size={12}/>} label="Report"/>
          </div>
          {comment.replies?.map((r:any) => <CommentItem key={r.id} comment={r} depth={depth+1}/>)}
        </>
      )}
    </div>
  );
}

function ProfileView({ user, posts, onVote, onSave, onPollVote, onOpenPost, onOpenCommunity, onAward }: any) {
  const [tab, setTab] = useState('posts');
  const stats = [
    { label:'Post Karma', value:fmt(user?.postKarma||12480), icon:'⬆' },
    { label:'Comment Karma', value:fmt(user?.commentKarma||2760), icon:'💬' },
    { label:'Awards Given', value:'24', icon:'🏅' },
    { label:'Streak', value:'14 days 🔥', icon:'' },
  ];
  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#1a1a3e,#2d1b69)', borderRadius:'8px 8px 0 0', height:100 }}/>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderBottom:'none', padding:'0 20px 16px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginTop:-32, marginBottom:14 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:T.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#fff', border:`4px solid ${T.card}` }}>
            {(user?.username||'YO').slice(0,2).toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:T.text }}>u/{user?.username||'You'}</h2>
            <p style={{ margin:0, fontSize:13, color:T.muted }}>Member for 2 years • {fmt((user?.postKarma||0)+(user?.commentKarma||0))} karma</p>
          </div>
          <button style={{ padding:'7px 16px', borderRadius:8, border:`1px solid ${T.border}`, background:'none', color:T.text, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <Edit3 size={13}/>Edit Profile
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }}>
          {stats.map(s=>(
            <div key={s.label} style={{ background:T.hover, borderRadius:8, padding:'10px 12px', textAlign:'center' }}>
              <div style={{ fontSize:15, fontWeight:800, color:T.text }}>{s.icon} {s.value}</div>
              <div style={{ fontSize:11, color:T.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${T.border}` }}>
          {['posts','awards','about'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'10px 16px', background:'none', border:'none', borderBottom:tab===t?`2px solid ${T.accent}`:'2px solid transparent', color:tab===t?T.accent:T.muted, fontSize:13, fontWeight:tab===t?600:400, cursor:'pointer', textTransform:'capitalize' }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:tab==='posts'?'8px 12px':20 }}>
        {tab==='posts' && posts.map((p:any)=>(
          <div key={p.id} style={{ marginBottom:8 }}>
            <PostCard post={p} onVote={onVote} onSave={onSave} onPollVote={onPollVote} onOpenPost={onOpenPost} onOpenCommunity={onOpenCommunity} onAward={onAward}/>
          </div>
        ))}
        {tab==='awards' && (
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {AWARDS_LIST.map(aw=>(
              <div key={aw.id} style={{ background:T.hover, borderRadius:10, padding:'14px 16px', textAlign:'center', minWidth:100 }}>
                <div style={{ fontSize:28, marginBottom:6 }}>{aw.icon}</div>
                <div style={{ fontWeight:700, color:T.text, fontSize:13 }}>{aw.name}</div>
                <div style={{ color:T.accent, fontSize:12, marginTop:4 }}>×{Math.floor(Math.random()*10)+1}</div>
              </div>
            ))}
          </div>
        )}
        {tab==='about' && (
          <div style={{ display:'flex', gap:16, fontSize:14, color:T.muted, flexDirection:'column' }}>
            <div><Globe size={14} style={{ verticalAlign:'middle' }}/> <strong style={{ color:T.text }}>Cake day:</strong> May 10, 2023</div>
            <div><Users size={14} style={{ verticalAlign:'middle' }}/> <strong style={{ color:T.text }}>Communities:</strong> 7 joined</div>
            <div><Trophy size={14} style={{ verticalAlign:'middle' }}/> <strong style={{ color:T.text }}>Top community:</strong> r/technology</div>
          </div>
        )}
      </div>
    </div>
  );
}

function RightSidebar({ comm, communities, onOpenCommunity, onCreatePost }: any) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:16 }}>
        {comm ? (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <span style={{ fontSize:24 }}>{comm.icon}</span>
              <div>
                <div style={{ fontWeight:700, color:T.text, fontSize:15 }}>{comm.name}</div>
                <div style={{ color:T.muted, fontSize:12 }}>{comm.members} members</div>
              </div>
            </div>
            <p style={{ fontSize:13, color:T.muted, margin:'0 0 12px', lineHeight:1.6 }}>{comm.desc}</p>
            <button onClick={onCreatePost} style={{ width:'100%', padding:9, borderRadius:8, border:'none', background:T.accent, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:8 }}>+ Create Post</button>
            {comm.rules && (
              <div style={{ marginTop:14, borderTop:`1px solid ${T.border}`, paddingTop:12 }}>
                <div style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}><Shield size={13} color={T.accent}/>Rules</div>
                {comm.rules.map((rule:string, i:number)=>(
                  <div key={i} style={{ fontSize:12, color:T.muted, padding:'5px 0', borderBottom:`1px solid ${T.border}`, display:'flex', gap:8 }}>
                    <span style={{ color:T.accent, fontWeight:700, flexShrink:0 }}>{i+1}.</span>{rule}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p style={{ fontSize:13, color:T.muted, marginBottom:12 }}>Share your ideas with the community</p>
            <button onClick={onCreatePost} style={{ width:'100%', padding:9, borderRadius:8, border:'none', background:T.accent, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <Plus size={15}/>Create Post
            </button>
          </>
        )}
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:16 }}>
        <div style={{ fontWeight:700, fontSize:14, color:T.text, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}><TrendingUp size={14} color={T.accent}/>Trending</div>
        {TRENDING.map((t,i)=>(
          <div key={t.tag} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:i<TRENDING.length-1?`1px solid ${T.border}`:'none' }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:T.text }}>#{t.tag}</div>
              <div style={{ fontSize:11, color:T.muted }}>{t.posts}</div>
            </div>
            <span style={{ fontSize:12, color:T.muted, fontWeight:700 }}>#{i+1}</span>
          </div>
        ))}
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:8, padding:16 }}>
        <div style={{ fontWeight:700, fontSize:14, color:T.text, marginBottom:12, display:'flex', alignItems:'center', gap:6 }}><Crown size={14} color="#FFD700"/>Top Communities</div>
        {communities.slice(0,5).map((c:any,i:number)=>(
          <div key={c.id} onClick={()=>onOpenCommunity(c.name)} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:i<4?`1px solid ${T.border}`:'none', cursor:'pointer' }}>
            <span style={{ color:T.muted, fontWeight:700, fontSize:13, minWidth:20 }}>#{i+1}</span>
            <span style={{ fontSize:18 }}>{c.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.name}</div>
              <div style={{ fontSize:11, color:T.muted }}>{c.members}</div>
            </div>
            <div style={{ width:8, height:8, borderRadius:'50%', background:c.joined?'#27AE60':T.border }}/>
          </div>
        ))}
      </div>
      <div style={{ fontSize:11, color:T.muted, lineHeight:1.8, padding:'0 4px' }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'2px 8px', marginBottom:8 }}>
          {['Help','About','Careers','Privacy','Terms'].map(l=>(
            <span key={l} style={{ cursor:'pointer', textDecoration:'underline' }}>{l}</span>
          ))}
        </div>
        <div>ThreadVerse © 2025. All rights reserved.</div>
      </div>
    </div>
  );
}
