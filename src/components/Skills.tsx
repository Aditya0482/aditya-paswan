import { motion } from 'motion/react';

const skills = [
  { name: 'SQL', level: 92 },
  { name: 'Python (Pandas, NumPy)', level: 85 },
  { name: 'ETL/Data Pipeline', level: 70 },
  { name: 'Power BI / Tableau', level: 88 },
  { name: 'Excel (Advanced)', level: 82 },
  { name: 'Data Cleaning & Visualization', level: 80 },
];

export function Skills() {
  return (
    <section id="skills" className="py-24 bg-white/[0.02]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 inline-block border-b-4 border-yellow-500 pb-2">
            Technical <span className="text-yellow-500">Skills</span>
          </h2>
          <p className="text-gray-400">Tools and technologies I use to extract value from data.</p>
        </motion.div>

        <div className="max-w-3xl mx-auto grid gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex justify-between mb-2">
                <span className="font-medium">{skill.name}</span>
                <span className="text-gray-400">{skill.level}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.level}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
