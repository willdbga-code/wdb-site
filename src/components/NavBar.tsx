import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="fixed top-0 left-0 w-full p-6 md:px-12 lg:px-24 z-[90] flex justify-between items-center mix-blend-difference text-white pointer-events-none">
      <Link href="/" className="font-serif tracking-widest uppercase hover:text-primary transition-colors pointer-events-auto">
         W <span className="text-primary italic lowercase">d</span> B
      </Link>
      <nav className="flex gap-6 md:gap-12 text-[10px] md:text-xs uppercase tracking-[0.2em] font-mono pointer-events-auto">
         <Link href="/portfolio" className="hover:text-primary transition-colors">Galeria</Link>
         <Link href="/about" className="hover:text-primary transition-colors hidden md:block">Filosofia</Link>
         <Link href="/login" className="text-primary border-b border-primary/30 hover:border-primary transition-colors pb-1">
           Área do Cliente
         </Link>
      </nav>
    </header>
  );
}
