import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { saveContactMessage } from '../api';
import emailjs from '@emailjs/browser';

const loadImage = (src: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

const findResumeImages = async (): Promise<string[]> => {
  const page1Candidates = ['/myresume.png', '/myresume-page1.png', '/myresume1.png', '/myresume_page1.png'];
  const page2Candidates = ['/myresume-page2.png', '/myresume2.png', '/myresume_page2.png'];

  let page1Src = '/myresume.png';
  for (const src of page1Candidates) {
    const img = await loadImage(src);
    if (img) {
      page1Src = src;
      break;
    }
  }

  let page2Src: string | null = null;
  for (const src of page2Candidates) {
    const img = await loadImage(src);
    if (img) {
      page2Src = src;
      break;
    }
  }

  return page2Src ? [page1Src, page2Src] : [page1Src];
};

const fetchEmailJsConfig = async () => {
  const envServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const envTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const envPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (envServiceId && envTemplateId && envPublicKey) {
    return {
      serviceId: envServiceId,
      templateId: envTemplateId,
      publicKey: envPublicKey
    };
  }

  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      return {
        serviceId: envServiceId || data.emailjs?.serviceId || '',
        templateId: envTemplateId || data.emailjs?.templateId || '',
        publicKey: envPublicKey || data.emailjs?.publicKey || ''
      };
    }
  } catch (err) {
    console.warn('Could not fetch runtime config from /api/config:', err);
  }

  return {
    serviceId: envServiceId || '',
    templateId: envTemplateId || '',
    publicKey: envPublicKey || ''
  };
};

export function Contact() {
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resumePages, setResumePages] = useState<string[]>(['/myresume.png']);

  useEffect(() => {
    findResumeImages().then((pages) => {
      setResumePages(pages);
    });
  }, []);

  const downloadAsPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const pages = await findResumeImages();
      const loadedImages: HTMLImageElement[] = [];

      for (const src of pages) {
        const img = await loadImage(src);
        if (img) loadedImages.push(img);
      }

      if (loadedImages.length === 0) {
        alert('Failed to load resume image. Please ensure myresume.png or myresume2.png exists in the public directory.');
        return;
      }

      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;

      loadedImages.forEach((img, index) => {
        if (index > 0) {
          doc.addPage();
        }
        const imgHeight = (img.height * pdfWidth) / img.width;
        const finalHeight = Math.min(imgHeight, pdfHeight);
        doc.addImage(img, 'PNG', 0, 0, pdfWidth, finalHeight);
      });

      doc.save('Aditya_Paswan_Resume.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 inline-block border-b-4 border-yellow-500 pb-2">
            Let's <span className="text-yellow-500">Connect</span>
          </h2>
          <p className="text-gray-400">Have a project in mind or want to discuss data strategies?</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-8"
          >
            <form 
              className="flex flex-col gap-6"
              onSubmit={async (e) => {
                e.preventDefault();
                if (isSubmitting) return;
                
                const form = e.currentTarget;
                const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
                
                setIsSubmitting(true);
                try {
                  const templateParams = {
                    name,
                    from_name: name,
                    user_name: name,
                    email,
                    from_email: email,
                    user_email: email,
                    reply_to: email,
                    message,
                    to_name: 'Aditya Paswan',
                    my_name: 'Aditya Paswan'
                  };

                  // Resolve EmailJS keys (build-time Vite env or runtime /api/config from Railway)
                  const { serviceId, templateId, publicKey } = await fetchEmailJsConfig();

                  const emailTask = (serviceId && templateId && publicKey)
                    ? emailjs.send(serviceId, templateId, templateParams, publicKey)
                    : Promise.reject(new Error('EmailJS keys not configured. Set VITE_EMAILJS_* in Railway.'));

                  // Send to backend (PostgreSQL + Telegram) and EmailJS in parallel
                  const [dbResult, emailResult] = await Promise.allSettled([
                    saveContactMessage(name, email, message),
                    emailTask
                  ]);

                  if (emailResult.status === 'fulfilled') {
                    console.log('✅ EmailJS email sent successfully:', emailResult.value);
                  } else {
                    console.error('⚠️ EmailJS warning:', emailResult.reason);
                  }

                  if (dbResult.status === 'rejected') {
                    console.error('⚠️ Database save error:', dbResult.reason);
                  }

                  setIsSubmitted(true);
                  form.reset();
                  setTimeout(() => setIsSubmitted(false), 5000);
                } catch (error) {
                  console.error("Error sending message: ", error);
                  alert("Failed to send message. Please try again.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Your Name"
                  required
                  pattern="^[a-zA-Z\s]+$"
                  title="Only letters and spaces are allowed"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Your Email"
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea
                  id="message"
                  placeholder="Your Message"
                  rows={4}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  isSubmitted 
                    ? 'bg-green-500 hover:bg-green-400 text-white' 
                    : isSubmitting
                    ? 'bg-yellow-500/70 text-black cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                }`}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Message Sent!
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>

              <AnimatePresence>
                {isSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4"
                  >
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm font-medium">
                        Message sent successfully! Please check your email for a confirmation.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Contact Info & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center gap-8"
          >
            <div id="resume" className="glass-card p-8 text-center flex-grow flex flex-col justify-center">
              <FileText className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">My Resume</h3>
              <p className="text-gray-400 mb-6 text-sm">Download my full resume to see my complete experience and education.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowResumeModal(true)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                >
                  Preview
                </button>
                <button 
                  onClick={downloadAsPDF}
                  disabled={isDownloadingPdf}
                  className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDownloadingPdf ? (
                    <><Loader2 size={18} className="animate-spin" /> Generating PDF...</>
                  ) : (
                    'Download PDF'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Resume Preview Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">Resume Preview</h3>
                <span className="text-xs px-2.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full font-mono">
                  {resumePages.length} {resumePages.length === 1 ? 'Page' : 'Pages'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={downloadAsPDF}
                  disabled={isDownloadingPdf}
                  className="px-4 py-1.5 bg-yellow-500 text-black hover:bg-yellow-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  {isDownloadingPdf ? (
                    <><Loader2 size={16} className="animate-spin" /> Generating PDF...</>
                  ) : (
                    'Download PDF'
                  )}
                </button>
                <button 
                  onClick={() => setShowResumeModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 md:p-8 overflow-y-auto flex-grow flex flex-col items-center gap-8 bg-black/60">
              {resumePages.map((pageSrc, index) => (
                <div key={index} className="w-full max-w-3xl flex flex-col items-center">
                  <div className="w-full flex justify-between items-center mb-2 px-1 text-xs font-mono text-gray-400">
                    <span>Page {index + 1} of {resumePages.length}</span>
                  </div>
                  <img 
                    src={pageSrc} 
                    alt={`Resume Page ${index + 1}`} 
                    className="w-full h-auto shadow-2xl rounded-lg border border-white/10 bg-white" 
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
