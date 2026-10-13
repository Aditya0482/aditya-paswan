export function Footer() {
  return (
    <footer className="py-8 border-t border-white/10 bg-[#050505] relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center flex flex-col items-center gap-6">
        <p className="text-gray-500 text-sm mt-2">
          © {new Date().getFullYear()} Aditya Paswan. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
