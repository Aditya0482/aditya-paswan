import { motion } from 'motion/react';
import { GraduationCap, Calendar, MapPin } from 'lucide-react';

const educationData = [
  {
    degree: 'Master of Computer Application (MCA)',
    institution: 'HRIT University',
    period: '2025 - 2027',
    location: 'UP, India',
  },
  {
    degree: 'Bachelor of Computer Application (BCA)',
    institution: 'Chaudhary Charan Singh University',
    period: '2022 - 2025',
    location: 'UP, India',
  },
  {
    degree: '12th Standard (Senior Secondary)',
    institution: 'Diwakar Model School (CBSE)',
    period: '2021 - 2022',
    location: 'UP, India',
  },
  {
    degree: '10th Standard (Secondary)',
    institution: 'Diwakar Model School (CBSE)',
    period: '2019 - 2020',
    location: 'UP, India',
  },
];

export function Education() {
  return (
    <section id="education" className="py-24 relative bg-[#050505]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold inline-block border-b-4 border-yellow-500 pb-2">
            My <span className="text-yellow-500">Education</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-yellow-500/20 md:-translate-x-1/2" />

          <div className="space-y-12">
            {educationData.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${
                  index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] -translate-x-1/2 mt-6 md:mt-0 z-10" />

                {/* Content Card */}
                <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${
                  index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                }`}>
                  <div className="glass-card p-6 md:p-8 hover:border-yellow-500/30 transition-colors group flex flex-col items-start text-left">
                    <div className="flex items-center gap-2 mb-3 text-yellow-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-mono font-medium">{item.period}</span>
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold mb-3 text-white group-hover:text-yellow-400 transition-colors">
                      {item.degree}
                    </h3>
                    
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex items-start gap-2 text-gray-300">
                        <GraduationCap className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="font-medium text-left leading-tight">{item.institution}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-5 h-5 shrink-0" />
                        <span className="text-sm leading-tight">{item.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
