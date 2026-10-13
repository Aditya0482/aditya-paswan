import { motion } from 'motion/react';
import { Database, LineChart, Lightbulb } from 'lucide-react';

const highlights = [
  {
    icon: <Database className="w-6 h-6 text-yellow-400" />,
    title: 'Data Storytelling',
    points: [
      'Transform raw data into meaningful insights.',
      'Create clear and interactive dashboards.',
      'Present trends using charts and visualizations.',
      'Simplify complex data for better understanding.',
      'Support data-driven business decisions.'
    ],
  },
  {
    icon: <LineChart className="w-6 h-6 text-yellow-500" />,
    title: 'Business Insight',
    points: [
      'Analyze business performance and KPIs.',
      'Identify trends, opportunities, and challenges.',
      'Generate actionable business insights.',
      'Improve decision-making with data analysis.',
      'Support business growth through analytics.'
    ],
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-yellow-300" />,
    title: 'Analytical Thinking',
    points: [
      'Break down complex business problems.',
      'Identify patterns and root causes.',
      'Analyze data with logical reasoning.',
      'Evaluate solutions using facts and evidence.',
      'Make informed, data-driven decisions.'
    ],
  },
];

export function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 inline-block border-b-4 border-yellow-500 pb-2">
            About <span className="text-yellow-500">Me</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed text-left">
            I am a detail-oriented Data Analyst with a strong drive for uncovering hidden patterns in complex datasets. 
            With expertise in SQL, Python, and modern BI tools, I bridge the gap between technical data and 
            strategic business objectives. My focus is on delivering high-impact insights that empower organizations 
            to make data-driven decisions with confidence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-8 hover:bg-white/10 transition-colors text-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 mx-auto">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center w-full">{item.title}</h3>
              <ul className="text-gray-400 leading-relaxed text-left w-full list-disc pl-4 space-y-2 text-sm">
                {item.points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
