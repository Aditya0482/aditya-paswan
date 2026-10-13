import { useState, useEffect, useRef } from 'react';

export function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      let progress = 0;
      if (windowHeight > 0) {
        progress = (scrollTop / windowHeight) * 100;
      }
      
      // Ensure progress is between 0 and 100
      progress = Math.max(0, Math.min(100, progress));
      
      setScrollProgress(progress);

      if (scrollTop > lastScrollTop.current) {
        setIsScrollingDown(true);
      } else if (scrollTop < lastScrollTop.current) {
        setIsScrollingDown(false);
      }
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;

      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial calculation
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-gray-800/30" />
      <div 
        className="h-full bg-yellow-500 relative will-change-[width]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
