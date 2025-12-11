export default function About() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">

        {/* Label */}
        <p className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase mb-3">
          About the Creator
        </p>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4">
          A regular person trying to build useful things
        </h1>

        <p className="text-slate-300 text-lg mb-8 max-w-2xl">
          My name isn’t important right now. What matters is the work. I’m not a
          Silicon Valley founder, or a VC project, or a “startup company.” I’m a
          normal person with a normal life who sees real-world problems and
          tries to build practical solutions for them.
        </p>

        <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 md:p-8 shadow-lg shadow-black/40 space-y-6">

          <p className="text-slate-300">
            I work a regular job, raise my kid, and handle life like everyone
            else—messy, complicated, and still moving forward. I’m not perfect,
            but I try to be useful. That’s pretty much the mission behind
            everything you’ll see here.
          </p>

          <p className="text-slate-300">
            I help people whenever I can—mounting a TV, fixing something in
            someone’s house, troubleshooting a project, just being genuinely
            helpful. That kind of human-to-human support matters more than any
            brand or tech buzzword.
          </p>

          <p className="text-slate-300">
            Stuff N Things isn’t a corporation. It’s just a container for
            whatever I end up building—apps, tools, hardware ideas, writing,
            stories, whatever comes next.
          </p>

        </section>

        {/* Bottom */}
        <p className="text-xs text-slate-500 mt-8">
          If any of these projects help even one person, then this was worth
          building. That’s the entire point.
        </p>
      </div>
    </main>
  );
}
