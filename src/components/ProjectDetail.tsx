import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ExternalLink, Edit, Trash2, CheckCircle2, X, Upload, AlertTriangle } from 'lucide-react';
import { getProjects, Project } from './Projects';
import { auth, saveProjectApi, deleteProjectApi } from '../api';

export function ProjectDetail() {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
  const { id } = useParams();
  const navigate = useNavigate();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | undefined>(undefined);
  
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
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    tech: '',
    description: '',
    result: '',
    image: '',
    demoUrl: ''
  });

  useEffect(() => {
    const loadProject = async () => {
      const projects = await getProjects();
      setAllProjects(projects);
      setProject(projects.find(p => p.id === id));
    };
    loadProject();
  }, [id]);

  const openEditModal = () => {
    if (project) {
      setFormData({
        title: project.title,
        tech: project.tech.join(', '),
        description: project.description,
        result: project.result,
        image: project.image,
        demoUrl: project.demoUrl === '#' ? '' : (project.demoUrl || '')
      });
      setIsEditModalOpen(true);
    }
  };

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

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!project) return;

    const updatedProject: Project = {
      ...project,
      title: formData.title.trim(),
      description: formData.description.trim(),
      tech: formData.tech.split(',').map(t => t.trim()).filter(Boolean),
      result: formData.result.trim(),
      image: formData.image,
      demoUrl: formData.demoUrl.trim() || '#'
    };

    try {
      await saveProjectApi(updatedProject);
      const updatedProjects = allProjects.map(p => p.id === id ? updatedProject : p);
      setAllProjects(updatedProjects);
      setProject(updatedProject);
      localStorage.setItem('portfolio_projects', JSON.stringify(updatedProjects));
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error("Error updating project:", err);
      alert(err.message || 'Failed to update project. Please verify admin session.');
    }
  };

  const confirmDelete = async () => {
    if (id) {
      try {
        await deleteProjectApi(id);
        const updatedProjects = allProjects.filter(p => p.id !== id);
        setAllProjects(updatedProjects);
        setIsDeleteModalOpen(false);
        localStorage.setItem('portfolio_projects', JSON.stringify(updatedProjects));
        navigate('/projects');
      } catch (err: any) {
        console.error("Error deleting project:", err);
        alert(err.message || 'Failed to delete project. Please verify admin session.');
      }
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold mb-4">Project Not Found</h2>
        <Link to="/projects" className="text-yellow-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <section className="py-24 pt-32 relative min-h-screen">
      <div className="w-full px-4 md:px-8 max-w-5xl mx-auto">
        <Link to="/projects" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors mb-12">
          <ArrowLeft size={20} /> Back to Projects
        </Link>

        <div className="flex flex-col gap-12 items-center">
          {/* Top: Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(250,204,21,0.1)]"
          >
            <img src={project.image} alt={project.title} className="w-full max-h-[500px] object-cover" />
          </motion.div>

          {/* Bottom: Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-8 w-full"
          >
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">{project.title}</h1>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {project.tech.map(t => (
                  <span key={t} className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-sm font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-white flex items-center gap-2">
                Description
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {project.description}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 text-yellow-500 flex items-center gap-2">
                <CheckCircle2 size={24} /> Result / Impact
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {project.result}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href={project.demoUrl} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
                <ExternalLink size={20} /> Live Demo
              </a>
              <div className="relative flex-1 group">
                <button 
                  onClick={(e) => {
                    if (!isAdmin) {
                      e.preventDefault();
                      return;
                    }
                    openEditModal();
                  }}
                  className={`w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Edit size={20} /> Edit
                </button>
                {!isAdmin && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-[#111] border border-yellow-500/50 text-yellow-400 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible group-active:opacity-100 group-active:visible transition-all duration-300 whitespace-nowrap z-50 shadow-[0_0_15px_rgba(250,204,21,0.2)] pointer-events-none">
                    Only for admin rights......!!
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-yellow-500/50"></div>
                  </div>
                )}
              </div>
              <div className="relative flex-1 group">
                <button 
                  onClick={(e) => {
                    if (!isAdmin) {
                      e.preventDefault();
                      return;
                    }
                    setIsDeleteModalOpen(true);
                  }}
                  className={`w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Trash2 size={20} /> Delete
                </button>
                {!isAdmin && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-[#111] border border-yellow-500/50 text-yellow-400 text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible group-active:opacity-100 group-active:visible transition-all duration-300 whitespace-nowrap z-50 shadow-[0_0_15px_rgba(250,204,21,0.2)] pointer-events-none">
                    Only for admin rights......!!
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-yellow-500/50"></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111] border border-red-500/30 rounded-2xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">Delete Project?</h3>
                <p className="text-gray-400">
                  Are you sure you want to delete <span className="text-white font-semibold">"{project.title}"</span>? This action cannot be undone.
                </p>
              </div>
              
              <div className="p-6 pt-0 flex gap-4">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-lg font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl my-auto flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold text-white">Edit Project</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Project Image</label>
                  <div className="relative w-full h-40 border-2 border-dashed border-white/20 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-colors bg-black/40 flex items-center justify-center group cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-white/10 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-6 py-3 rounded-lg font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                  >
                    Save Changes
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
