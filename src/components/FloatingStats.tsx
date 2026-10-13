import { useState, useEffect, useRef } from 'react';
import { Users, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'motion/react';

export function FloatingStats() {
  const [isMuted, setIsMuted] = useState(true);
  const [visitors, setVisitors] = useState<number | null>(null);
  
  // Audio Context for scroll sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const scrollAccumulator = useRef(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const fetchVisitors = async () => {
      // Force remove any old cached visitor numbers
      try {
        localStorage.removeItem('abacus_visitors');
        localStorage.removeItem('cached_visitor_count');
      } catch (e) {}

      try {
        const response = await fetch('/api/visitors', {
          method: 'GET',
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          if (typeof data.count === 'number') {
            setVisitors(data.count);
            return;
          }
        }
      } catch (error) {
        console.warn('Visitor counter fetch notice:', error);
      }
      
      setVisitors(48);
    };

    fetchVisitors();
  }, []);

  useEffect(() => {
    // Initialize audio context on first interaction to satisfy browser autoplay policies
    const initAudioOnInteraction = () => {
      if (!audioCtxRef.current) {
        try {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch(e) {}
      }
      
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().then(() => {
          if (audioCtxRef.current?.state === 'running') {
            ['click', 'mousedown', 'touchstart', 'keydown'].forEach(event => {
              window.removeEventListener(event, initAudioOnInteraction);
            });
          }
        }).catch(() => {});
      } else if (audioCtxRef.current?.state === 'running') {
        ['click', 'mousedown', 'touchstart', 'keydown'].forEach(event => {
          window.removeEventListener(event, initAudioOnInteraction);
        });
      }
    };

    ['click', 'mousedown', 'touchstart', 'keydown'].forEach(event => {
      window.addEventListener(event, initAudioOnInteraction, { passive: true });
    });

    return () => {
      ['click', 'mousedown', 'touchstart', 'keydown'].forEach(event => {
        window.removeEventListener(event, initAudioOnInteraction);
      });
    };
  }, []);

  const playScrollTick = () => {
    if (isMuted) return;
    
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // If still suspended after trying to resume (due to browser policy), don't queue up sounds
      if (ctx.state === 'suspended') return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Create a subtle "tick" or "pop" sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error("Audio play failed:", e);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (isMuted) return;
      
      const currentScrollY = window.scrollY;
      const delta = Math.abs(currentScrollY - lastScrollY.current);
      lastScrollY.current = currentScrollY;
      
      scrollAccumulator.current += delta;
      
      // Play a tick every 15 pixels scrolled
      if (scrollAccumulator.current > 15) {
        scrollAccumulator.current = 0;
        playScrollTick();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Initialize audio context on first user interaction if unmuting
    if (isMuted && !audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current.resume();
      } catch (e) {
        console.error("Audio context init failed:", e);
      }
    }
  };

  const formatNumber = (num: number | null) => {
    if (num === null) return 'Loading........';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-[90]"
    >
      <div className="animate-float-sync p-2 rounded-2xl flex flex-wrap md:flex-nowrap items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.15)] border border-yellow-500/20 bg-[#0a0a0a]/80 backdrop-blur-xl overflow-hidden relative group/stats">
        
        {/* Animated gradient background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover/stats:opacity-100 transition-opacity duration-500" />

        {/* Total Visitors Box */}
        <div className="relative flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-colors px-4 py-2.5 rounded-xl border border-white/5">
          <div className="bg-yellow-500/20 p-2 rounded-lg">
            <Users size={18} className="text-yellow-500" />
          </div>
          <div className="flex flex-col items-center pr-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none mb-1.5">Visitors</span>
            <span className="text-base font-bold leading-none text-white tracking-tight">
              {formatNumber(visitors)}
            </span>
          </div>
        </div>

        {/* Sound Control Box (Only Mute/Unmute Icon) */}
        <div className="relative flex items-center bg-white/5 p-1.5 rounded-xl border border-white/5 transition-all">
          <button 
            onClick={toggleMute}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? (
              <VolumeX size={20} className="text-gray-400 hover:text-white transition-colors" />
            ) : (
              <Volume2 size={20} className="text-yellow-400" fill="currentColor" />
            )}
          </button>
        </div>
        
      </div>
    </motion.div>
  );
}
