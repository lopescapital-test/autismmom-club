export default function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-background px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm font-body text-foreground/60 leading-relaxed max-w-2xl mx-auto">
          &copy; {new Date().getFullYear()} Autism+ Moms Club. 
          <br className="sm:hidden" /> This platform shares parent experiences and is not medical advice. We strictly prohibit content promoting unproven biomedical protocols or cures.
        </p>
      </div>
    </footer>
  );
}
