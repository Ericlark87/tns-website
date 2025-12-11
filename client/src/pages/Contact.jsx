import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: hook to backend contact endpoint (email, ticket, etc.)
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Message received.
        </h1>
        <p className="text-slate-300 text-sm md:text-base">
          We’ve logged your message. When the dust settles and we’ve got a clear
          answer, we’ll reach back out. No spam. No marketing drip. Just a
          response.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 space-y-6">
      <section>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Contact QuitChampion
        </h1>
        <p className="text-slate-300 text-sm md:text-base">
          Stuck, confused, or something broken? Tell us what&apos;s going on.
          This inbox is for real issues and real feedback — not sales fluff.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1"
          >
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            value={form.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500"
            placeholder="What do you need help with?"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            value={form.message}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-mint-500 resize-vertical"
            placeholder="Give as much detail as you want. Screenshots, device, what you were doing, etc."
          />
        </div>

        <button
          type="submit"
          className="w-full md:w-auto bg-mint-500 hover:bg-mint-400 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-mint-500/40"
        >
          Send message
        </button>
      </form>
    </div>
  );
}
