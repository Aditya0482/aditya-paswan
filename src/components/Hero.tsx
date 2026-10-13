import { motion } from 'motion/react';
import { Download, Mail } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';

export function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] -z-10" />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-yellow-500 p-1 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
            <img
              src="/profile.png"
              alt="Aditya Paswan"
              className="w-full h-full object-cover object-top rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(234,179,8,0.2)] -z-10" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4"
        >
          <span className="whitespace-nowrap">Hi, I'm</span>
          <span className="inline-block w-[300px] md:w-[500px] text-center md:text-left">
            <TypeAnimation
              sequence={[
                'Aditya Paswan',
                2500,
                'Data Analyst',
                2500,
                'Retail Investor',
                2500,
                'Digital Creator',
                2500
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="text-yellow-400"
            />
          </span>
        </motion.h1>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-yellow-400 font-medium mb-6"
        >
          SQL | Python | Power BI | Excel
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-400 max-w-2xl text-lg mb-10"
        >
          Transforming complex datasets into actionable business intelligence and strategic insights.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <a
            href="#resume"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            <Download size={20} />
            Download Resume
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-card hover:bg-white/10 transition-colors font-medium rounded-full"
          >
            <Mail size={20} />
            Contact Me
          </a>
        </motion.div>
      </div>
    </section>
  );
}
