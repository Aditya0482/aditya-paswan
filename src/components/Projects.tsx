import { useState, useEffect, useRef, MouseEvent, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence, animate, useInView } from 'motion/react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Plus, X, Upload, FileCog, ArrowLeft, FolderOpen, Loader2 } from 'lucide-react';
import { auth, fetchProjects, saveProjectApi, deleteProjectApi, voteProjectApi, Project } from '../api';

export type { Project };

export const getLocalProjects = (): Project[] => {
  const saved = localStorage.getItem('portfolio_projects');
  if (saved) {
    try {
      const parsed: Project[] = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {}
  }
  return [];
};

export const getProjects = async (): Promise<Project[]> => {
  const list = await fetchProjects();
  return Array.isArray(list) ? list : [];
};

export const saveProjects = async (projects: Project[]) => {
  localStorage.setItem('portfolio_projects', JSON.stringify(projects));
};

export const deleteProject = async (id: string) => {
  try {
    await deleteProjectApi(id);
    const saved = localStorage.getItem('portfolio_projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      const updated = parsed.filter((p: Project) => p.id !== id);
      localStorage.setItem('portfolio_projects', JSON.stringify(updated));
    }
  } catch (error) {
    console.error("Error deleting project from backend:", error);
    throw error;
  }
};

function StatsSlider({ totalProjects, totalLikes }: { totalProjects: number, totalLikes: number }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const [displayProjects, setDisplayProjects] = useState(0);
  const [displayLikes, setDisplayLikes] = useState(0);

  useEffect(() => {
    if (isInView && (totalProjects > 0 || totalLikes > 0)) {
      const pControls = animate(0, totalProjects, { 
        duration: 2, 
        ease: "easeOut", 
        onUpdate: v => setDisplayProjects(Math.round(v)) 
      });
      const lControls = animate(0, totalLikes, { 
        duration: 2, 
        ease: "easeOut", 
        onUpdate: v => setDisplayLikes(Math.round(v)) 
      });
      return () => {
        pControls.stop();
        lControls.stop();
      };
    } else if (!isInView) {
      setDisplayProjects(0);
      setDisplayLikes(0);
    }
  }, [isInView, totalProjects, totalLikes]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };
  
  const stats = [
    {
      label: "Total Projects",
      value: formatNumber(displayProjects),
      icon: <FileCog size={80} className="text-yellow-500 mb-6" />
    },
    {
      label: "Total Likes",
      value: formatNumber(displayLikes),
      icon: <ThumbsUp size={80} className="text-yellow-500 mb-6" />
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [stats.length]);

  return (
    <div ref={ref} className="w-full max-w-3xl mx-auto mt-32 mb-8 overflow-hidden relative h-64 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center text-center absolute w-full"
        >
          {stats[currentIndex].icon}
          <h3 className="text-7xl font-display font-bold text-white mb-4">{stats[currentIndex].value}</h3>
          <p className="text-2xl text-gray-400 font-medium">{stats[currentIndex].label}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProjectCard({ project, index, onUpdate }: { key?: string | number, project: Project, index: number, onUpdate: (p: Project) => void | Promise<void> }) {
  const [action, setAction] = useState<'like' | 'dislike' | null>(() => {
    const savedVotes = localStorage.getItem('portfolio_votes');
    if (savedVotes) {
      try {
        const parsed = JSON.parse(savedVotes);
        return parsed[project.id] || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const saveVote = (newAction: 'like' | 'dislike' | null) => {
    const savedVotes = localStorage.getItem('portfolio_votes');
    let parsed: Record<string, 'like' | 'dislike'> = {};
    if (savedVotes) {
      try { parsed = JSON.parse(savedVotes); } catch (e) {}
    }
    if (newAction) {
      parsed[project.id] = newAction;
    } else {
      delete parsed[project.id];
    }
    localStorage.setItem('portfolio_votes', JSON.stringify(parsed));
    setAction(newAction);
  };

  const likes = project.likes || 0;
  const dislikes = project.dislikes || 0;

  const handleLike = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let newLikes = likes;
    let newDislikes = dislikes;
    let newAction: 'like' | 'dislike' | null = null;
    
    if (action === 'like') {
      newLikes -= 1;
      newAction = null;
    } else {
      newLikes += 1;
      if (action === 'dislike') newDislikes -= 1;
      newAction = 'like';
    }
    saveVote(newAction);
    onUpdate({ ...project, likes: newLikes, dislikes: newDislikes });
  };

  const handleDislike = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let newLikes = likes;
    let newDislikes = dislikes;
    let newAction: 'like' | 'dislike' | null = null;

    if (action === 'dislike') {
      newDislikes -= 1;
      newAction = null;
    } else {
      newDislikes += 1;
      if (action === 'like') newLikes -= 1;
      newAction = 'dislike';
    }
    saveVote(newAction);
    onUpdate({ ...project, likes: newLikes, dislikes: newDislikes });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card overflow-hidden group flex flex-col cursor-pointer"
    >
      <Link to={`/project/${project.id}`} className="flex flex-col flex-grow">
        <div className="relative h-48 overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
          <img 
            src={project.image} 
            alt={project.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-2xl font-semibold mb-2 text-white group-hover:text-yellow-400 transition-colors">{project.title}</h3>
          <p className="text-gray-400 text-sm mb-6 line-clamp-2">{project.description}</p>
          
          <div className="mt-auto flex flex-col gap-4">
            <span className="block text-center text-yellow-500 hover:text-yellow-400 transition-colors font-medium">
              View Details
            </span>
            
            <div className="flex items-center justify-center gap-8 pt-4 border-t border-white/10">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${action === 'like' ? 'text-green-500' : 'text-gray-400 hover:text-green-400'}`}
              >
                <ThumbsUp size={18} className={action === 'like' ? 'fill-green-500' : ''} />
                <span className="text-sm font-medium">{likes}</span>
              </button>
              <button 
                onClick={handleDislike}
                className={`flex items-center gap-2 transition-colors ${action === 'dislike' ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
              >
                <ThumbsDown size={18} className={action === 'dislike' ? 'fill-red-500' : ''} />
                <span className="text-sm font-medium">{dislikes}</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function Projects() {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const [projects, setProjects] = useState<Project[]>(getLocalProjects());
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      const isUserAdmin = Boolean(
        user?.isAdmin ||
        (import.meta.env.VITE_ADMIN_EMAIL &&
          user?.email?.toLowerCase() === import.meta.env.VITE_ADMIN_EMAIL.toLowerCase())
      );
      if (isUserAdmin) {
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
      } else if (user) {
        localStorage.removeItem('isAdmin');
        setIsAdmin(false);
      } else {
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
      }
    });
    return () => unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    tech: '',
    description: '',
    result: '',
    image: '',
    demoUrl: ''
  });

  useEffect(() => {
    setIsLoading(true);
    fetchProjects().then(loaded => {
      setProjects(loaded || []);
    }).catch(err => {
      console.error("Error loading projects from PostgreSQL:", err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    const newProject: Project = {
      id: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      tech: formData.tech.split(',').map(t => t.trim()).filter(Boolean),
      result: formData.result.trim(),
      demoUrl: formData.demoUrl.trim() || '#',
      githubUrl: '#',
      image: formData.image || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800&auto=format&fit=crop',
      likes: 0,
      dislikes: 0
    };

    try {
      const saved = await saveProjectApi(newProject);
      const updated = [saved, ...projects.filter(p => p.id !== saved.id)];
      setProjects(updated);
      localStorage.setItem('portfolio_projects', JSON.stringify(updated));
      setFormData({ title: '', tech: '', description: '', result: '', image: '', demoUrl: '' });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving project:", err);
      setSaveError(err.message || 'Failed to save project to PostgreSQL database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    try {
      await saveProjectApi(updatedProject);
      const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
      setProjects(updatedProjects);
      localStorage.setItem('portfolio_projects', JSON.stringify(updatedProjects));
    } catch (error) {
      console.error("Error updating project in backend:", error);
    }
  };

  const totalLikes = projects.reduce((sum, p) => sum + (p.likes || 0), 0);

  return (
    <section id="projects" className="py-24 pt-32 relative min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={20} /> Back to Admin Panel
          </Link>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 inline-block border-b-4 border-yellow-500 pb-2">
            Featured <span className="text-yellow-500">Projects</span>
          </h2>
          <p className="text-gray-400 mb-6">A selection of my recent analytical work.</p>
          
          <div className="relative group inline-block">
            <button 
              onClick={(e) => {
                if (!isAdmin) {
                  e.preventDefault();
                  return;
                }
                setIsModalOpen(true);
              }}
              className={`inline-flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-6 py-2.5 rounded-lg font-semibold transition-colors ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus size={20} strokeWidth={2.5} /> Add Project
            </button>
            {!isAdmin && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-[#111] border border-yellow-500/50 text-yellow-400 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible group-active:opacity-100 group-active:visible transition-all duration-300 whitespace-nowrap z-50 shadow-[0_0_15px_rgba(250,204,21,0.2)] pointer-events-none">
                Only for admin rights......!!
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-yellow-500/50"></div>
              </div>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 size={40} className="text-yellow-500 animate-spin" />
            <p className="text-gray-400 font-medium">Loading projects from database...</p>
          </div>
        ) : projects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-white/10 rounded-2xl bg-black/20"
          >
            <FolderOpen size={48} className="text-gray-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-400 max-w-md">There are currently no projects to display. Check back later for some amazing work!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(showAll ? projects : projects.slice(0, 6)).map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} onUpdate={handleUpdateProject} />
            ))}
          </div>
        )}

        {projects.length > 6 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 flex justify-center"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-8 py-3 rounded-full font-semibold transition-colors"
            >
              {showAll ? 'Show Less' : 'View More'}
            </button>
          </motion.div>
        )}

        {/* Stats Slider Section */}
        <StatsSlider totalProjects={projects.length} totalLikes={totalLikes} />
      </div>

      {/* Add Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl my-auto flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white">Add New Project</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
                {saveError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                    <span>{saveError}</span>
                    <button type="button" onClick={() => setSaveError(null)} className="text-red-400 hover:text-white ml-2">
                      <X size={16} />
                    </button>
                  </div>
                )}
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Project Image</label>
                  <div className="relative w-full h-40 border-2 border-dashed border-white/20 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-colors bg-black/40 flex items-center justify-center group cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required
                    />
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 group-hover:text-yellow-500 transition-colors">
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm font-medium">Click to upload image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Project Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Enter your project title"
                  />
                </div>

                {/* Tech/Tools */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Tech / Tools (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tech}
                    onChange={e => setFormData({...formData, tech: e.target.value})}
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Enter your tools and technologies"
                  />
                </div>

                {/* Live Demo URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Live Demo URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={e => setFormData({...formData, demoUrl: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Enter your project url"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    required
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                    placeholder="What is this project about?"
                  />
                </div>

                {/* Result/Impact */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Result / Impact</label>
                  <textarea
                    value={formData.result}
                    onChange={e => setFormData({...formData, result: e.target.value})}
                    required
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                    placeholder="What was the outcome or impact?"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-white/10 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving && <Loader2 size={18} className="animate-spin" />}
                    {isSaving ? 'Saving Project...' : 'Add Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
