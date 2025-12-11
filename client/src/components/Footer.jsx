export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-slate-800 bg-slate-950/95 text-center text-xs text-slate-500">
      <p className="mb-1">
        QuitChampion LLC · a TNS Enterprises project · Tennessee
      </p>
      <p className="mb-1">
        &copy; {year} QuitChampion LLC. All rights reserved.
      </p>
      <p>
        <a
          href="/contact"
          className="text-mint-400 hover:text-mint-300 transition-all"
        >
          Contact us
        </a>
      </p>
    </footer>
  );
}
