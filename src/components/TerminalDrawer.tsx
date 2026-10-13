import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_HISTORY: { type: 'input' | 'output' | 'error' | 'system', content: string }[] = [
  { type: 'system', content: 'Aditya OS v1.0.0' },
  { type: 'system', content: 'Type "help" for a list of available commands.' }
];

export function TerminalDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error' | 'system', content: string }[]>(INITIAL_HISTORY);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    if (trimmedCmd) {
      setHistory(prev => [...prev, { type: 'input', content: cmd }]);
    } else {
      setHistory(prev => [...prev, { type: 'input', content: '' }]);
      return;
    }

    let output = '';
    let isError = false;

    switch (trimmedCmd) {
      case 'help':
        output = `Available Commands:
  about        - Display information about me
  skills       - List my technical skills
  certificates - View my certifications
  projects     - View my recent projects
  contact      - Show contact information
  whoami       - Display current user
  date         - Display current date
  time         - Display current time
  clear        - Clear the terminal screen
  exit         - Close the terminal`;
        break;
      case 'about':
        output = `Hello! I'm Aditya Paswan, a Data Engineer based in Ghaziabad, Uttar Pradesh, India.

I am passionate about data, analytics, and solving real-world problems using technology. My skill set includes SQL, MySQL, PostgreSQL, Python, Power BI, Advanced Excel, Pandas, NumPy, HTML, CSS, JavaScript, and API integration. I enjoy working with data pipelines, analyzing datasets, and creating interactive dashboards that turn data into actionable insights.

I completed my 10th and 12th grade from Diwakar Model School (CBSE Board), Uttar Pradesh, India. I earned my Bachelor of Computer Applications (BCA) from Chaudhary Charan Singh University (CCSU), Uttar Pradesh,India, and my Master of Computer Applications (MCA) from HRIT University, Uttar Pradesh,India.

I'm continuously learning, building projects, and enhancing my technical skills to grow as a Data Engineer. My goal is to develop efficient, data-driven solutions, contribute to impactful projects, and create meaningful value through data and technology.`;
        break;
      case 'skills':
        output = 'SQL, MySQL, PostgreSQL, Python, Pandas, NumPy, Power BI, Advanced Excel, ETL, REST API, HTML, CSS, JavaScript, Git, GitHub, Jupyter Notebook';
        break;
      case 'certificates':
        output = `1.🌐 Web Development with Python — Anudip Foundation
2.💻 WebTech with Python — Softpro India
3.📊 Complete Excel Guide — Kimo.AI
4.🤖 Data Analyst with GenAI — Ducat India`;
        break;
      case 'projects':
        output = 'To explore my projects, please visit the Projects section of this portfolio.......🚀!!';
        break;
      case 'contact':
        output = `📱 Phone: +91 850680XXXX
📧 Email: adityapaswan280@gmail.com
💼 LinkedIn: https://www.linkedin.com/in/adityapaswan280
💻 GitHub: https://github.com/Aditya0482
🐦 X (Twitter): https://x.com/aditya_04004
📸 Instagram: https://www.instagram.com/zoneaadityapaswan
✈️ Telegram: https://t.me/campaign04`;
        break;
      case 'whoami':
        output = 'guest_user';
        break;
      case 'date':
        output = new Date().toDateString();
        break;
      case 'time':
        output = new Date().toLocaleTimeString();
        break;
      case 'clear':
        setHistory(INITIAL_HISTORY);
        return;
      case 'exit':
        setIsOpen(false);
        return;
      case 'sudo':
      case 'rm':
        output = 'Permission denied. This incident will be reported.';
        isError = true;
        break;
      default:
        output = `Command not found: ${trimmedCmd}. Type "help" for available commands.`;
        isError = true;
    }

    setHistory(prev => [...prev, { type: isError ? 'error' : 'output', content: output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setHistory(INITIAL_HISTORY);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="fixed bottom-6 left-6 z-[80]"
          >
            <div className="animate-float-sync p-2 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.15)] border border-yellow-500/20 bg-[#0a0a0a]/80 backdrop-blur-xl overflow-hidden relative group/stats">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent opacity-0 group-hover/stats:opacity-100 transition-opacity duration-500" />
              <button 
                onClick={() => setIsOpen(true)}
                className="relative flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors p-2.5 rounded-xl border border-white/5 z-10"
                title="Open Terminal"
              >
                <TerminalIcon size={20} className="text-yellow-500 group-hover/stats:scale-110 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Drawer/Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 ${isFullscreen ? 'p-0 sm:p-0 md:p-0' : 'bg-black/60 backdrop-blur-sm'}`}
            onClick={(e) => {
               if (e.target === e.currentTarget && !isFullscreen) setIsOpen(false);
            }}
          >
            <motion.div
              initial={isFullscreen ? { opacity: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
              animate={isFullscreen ? { opacity: 1, scale: 1, y: 0 } : { scale: 1, opacity: 1, y: 0 }}
              exit={isFullscreen ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col overflow-hidden ${
                isFullscreen 
                  ? 'w-full h-full rounded-none border-none' 
                  : 'w-full max-w-4xl h-[70vh] rounded-2xl'
              }`}
            >
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/5 select-none">
                <div className="flex items-center gap-2">
                  <TerminalIcon size={16} className="text-yellow-500" />
                  <span className="text-xs font-mono text-gray-400">guest@aditya-portfolio:~</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Terminal Body */}
              <div 
                className="flex-1 p-4 overflow-y-auto font-mono text-sm"
                onClick={() => inputRef.current?.focus()}
              >
                {history.map((msg, idx) => (
                  <div key={idx} className="mb-2">
                    {msg.type === 'input' && (
                      <div className="flex items-start gap-2">
                        <span className="text-green-500 shrink-0">guest@aditya:~$</span>
                        <span className="text-white break-all">{msg.content}</span>
                      </div>
                    )}
                    {msg.type === 'output' && (
                      <div className="text-gray-300 whitespace-pre-wrap pl-2 border-l-2 border-gray-700/50 mt-1">{msg.content}</div>
                    )}
                    {msg.type === 'error' && (
                      <div className="text-red-400 whitespace-pre-wrap pl-2 border-l-2 border-red-900/50 mt-1">{msg.content}</div>
                    )}
                    {msg.type === 'system' && (
                      <div className="text-yellow-500/80 mb-4">{msg.content}</div>
                    )}
                  </div>
                ))}
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-green-500 shrink-0">guest@aditya:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-white font-mono caret-yellow-500"
                    spellCheck={false}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                <div ref={endOfMessagesRef} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
