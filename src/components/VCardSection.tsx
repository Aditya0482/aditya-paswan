import { useState, useRef, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, Globe, Linkedin, Github, Instagram, Send, Share2, Download, Loader2, Award } from 'lucide-react';
import { toPng } from 'html-to-image';

const certificates = [
  { id: 'anudip', imageSrc: '/anudip.jpeg', alt: 'Anudip Certificate' },
  { id: 'webwithpython', imageSrc: '/webwithpython.jpeg', alt: 'Web with Python Certificate' },
  { id: 'aitool', imageSrc: '/aitool.jpeg', alt: 'AI Tool Certificate' },
  { id: 'excel', imageSrc: '/excel.jpeg', alt: 'Excel Certificate' },
  { id: 'datascience', imageSrc: '/datascience.jpeg', alt: 'Data Science Certificate' },
  { id: 'digitalmarketing', imageSrc: '/digitalmarketing.jpeg', alt: 'Digital Marketing Certificate' },
  { id: 'js', imageSrc: '/js.jpeg', alt: 'JavaScript Certificate' },
];

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function VCardSection() {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const vcardRef = useRef<HTMLDivElement>(null);

  const shareVCard = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aditya Paswan - V-Card',
          text: 'Check out my digital business card!',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const downloadVCard = async () => {
    if (!vcardRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const filter = (node: HTMLElement) => {
        if (node?.id === 'vcard-action-buttons') return false;
        return true;
      };

      const dataUrl = await toPng(vcardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0a0a0a',
        filter: filter as any,
      });

      // Convert Data URL to Blob for better mobile browser support
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Aditya_Paswan_VCard.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating V-Card image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const SocialLink = ({ href, icon, label }: { href: string, icon: ReactNode, label: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 sm:gap-2 group w-[52px] sm:w-16">
      <div className="relative flex justify-center items-center">
        {/* Strong Glow Background */}
        <div className="absolute inset-2 bg-yellow-400/50 blur-[12px] rounded-full group-hover:bg-yellow-400/80 group-hover:blur-[16px] transition-all duration-300 z-0"></div>
        {/* Icon */}
        <div className="relative text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,1)] z-10">
          {icon}
        </div>
      </div>
      <span className="text-[9px] sm:text-xs text-white font-medium mt-1 text-center w-full truncate sm:overflow-visible sm:whitespace-normal">{label}</span>
    </a>
  );

  return (
    <section id="vcard" className="py-24 relative bg-[#050505] flex flex-col justify-center items-center overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 inline-block border-b-4 border-yellow-500 pb-2">
            My <span className="text-yellow-500">V-Card</span>
          </h2>
        </motion.div>

        <motion.div
          ref={vcardRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-[460px] bg-[#0a0a0a]/80 backdrop-blur-xl border-2 border-yellow-400 rounded-[40px] p-8 md:p-10 flex flex-col items-center shadow-[0_0_40px_rgba(250,204,21,0.3)]"
        >
        {/* Profile Image with Glow */}
        <div className="relative mt-4 mb-10">
          <div className="w-48 h-48 rounded-full border-[6px] border-yellow-400 p-1 shadow-[0_0_60px_rgba(250,204,21,0.7)] bg-[#050505]">
            <img 
              src="/profile.png" 
              alt="Aditya Paswan" 
              className="w-full h-full object-cover object-top rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Name */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-14 tracking-wide text-center flex flex-col items-center justify-center gap-2">
          <span className="whitespace-nowrap">Aditya Paswan</span>
          <span className="text-yellow-500 text-xl sm:text-2xl md:text-3xl font-medium">(Data Analyst)</span>
        </h2>

        {/* Contact Info */}
        <div className="w-full flex flex-col gap-4 sm:gap-6 mb-12 sm:mb-16 px-1 sm:px-2 md:px-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-sm sm:text-base md:text-xl text-white font-medium tracking-wide">+91 850680XXXX</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-sm sm:text-base md:text-xl text-white font-medium tracking-wide break-all">adityapaswan0280@gmail.com</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-black" strokeWidth={2.5} />
            </div>
            <a href="https://www.adityapaswan.com" target="_blank" rel="noopener noreferrer" className="text-sm sm:text-base md:text-xl text-white font-medium tracking-wide hover:text-yellow-400 transition-colors break-all">
              https://www.adityapaswan.com
            </a>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex justify-between items-center w-full px-1 sm:px-2 mb-12 sm:mb-16">
          <SocialLink href="https://www.linkedin.com/in/adityapaswan280" icon={<Linkedin className="w-7 h-7 sm:w-10 sm:h-10" strokeWidth={2} />} label="LinkedIn" />
          <SocialLink href="https://github.com/Aditya0482?tab=overview&from=2026-04-01&to=2026-04-10" icon={<Github className="w-7 h-7 sm:w-10 sm:h-10" strokeWidth={2} />} label="GitHub" />
          <SocialLink href="https://www.instagram.com/zoneaadityapaswan?igsh=NnVubzd2eWxvcDhv" icon={<Instagram className="w-7 h-7 sm:w-10 sm:h-10" strokeWidth={2} />} label="Instagram" />
          <SocialLink href="https://t.me/campaign04" icon={<Send className="w-7 h-7 sm:w-10 sm:h-10" strokeWidth={2} />} label="Telegram" />
          <SocialLink href="https://x.com/aditya_04004" icon={<XIcon className="w-7 h-7 sm:w-10 sm:h-10" />} label="X" />
        </div>

        {/* Action Buttons */}
        <div id="vcard-action-buttons" className="flex flex-row gap-2 md:gap-4 w-full px-1 mb-2 z-20 transition-opacity duration-200">
          <button 
            onClick={shareVCard}
            className="flex-1 py-3 px-2 rounded-xl border border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center gap-1 md:gap-2 text-xs sm:text-sm md:text-base whitespace-nowrap"
          >
            <Share2 size={16} className="w-4 h-4 md:w-5 md:h-5" /> {isCopied ? 'Copied!' : 'Share V-Card'}
          </button>
          <button 
            onClick={downloadVCard} 
            disabled={isDownloading}
            className="flex-1 py-3 px-2 rounded-xl border border-yellow-400 text-yellow-400 font-semibold hover:bg-yellow-400 hover:text-black transition-all flex items-center justify-center gap-1 md:gap-2 text-xs sm:text-sm md:text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <><Loader2 size={16} className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Downloading...</>
            ) : (
              <><Download size={16} className="w-4 h-4 md:w-5 md:h-5" /> Download V-Card</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Certificates Slider */}
      <div className="w-full mt-24 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h3 className="text-2xl md:text-3xl font-display font-bold mb-2 inline-block border-b-2 border-yellow-500 pb-1 text-white">
            My <span className="text-yellow-500">Certificates</span>
          </h3>
        </motion.div>

        <div className="relative w-full overflow-hidden max-w-7xl mx-auto">
          <motion.div
            className="flex w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          >
            {/* First Set */}
            <div className="flex gap-4 md:gap-6 pr-4 md:pr-6">
              {certificates.map((cert, index) => (
                <div
                  key={`cert-1-${index}`}
                  className="w-64 md:w-80 h-44 md:h-56 bg-[#0a0a0a]/80 backdrop-blur-sm border-2 border-yellow-400 rounded-2xl flex flex-col items-center justify-center p-2 shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:shadow-[0_0_30px_rgba(250,204,21,0.9)] hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                  <img src={cert.imageSrc} alt={cert.alt} className="w-full h-full object-contain rounded-xl" />
                </div>
              ))}
            </div>
            {/* Second Set (Duplicate for seamless loop) */}
            <div className="flex gap-4 md:gap-6 pr-4 md:pr-6">
              {certificates.map((cert, index) => (
                <div
                  key={`cert-2-${index}`}
                  className="w-64 md:w-80 h-44 md:h-56 bg-[#0a0a0a]/80 backdrop-blur-sm border-2 border-yellow-400 rounded-2xl flex flex-col items-center justify-center p-2 shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.5)] hover:shadow-[0_0_30px_rgba(250,204,21,0.9)] hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                  <img src={cert.imageSrc} alt={cert.alt} className="w-full h-full object-contain rounded-xl" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      </div>
    </section>
  );
}
