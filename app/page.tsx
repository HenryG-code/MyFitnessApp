export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="max-w-2xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-emerald-400">
          Deployment Test
        </p>

        <h1 className="text-4xl sm:text-6xl font-bold mb-6">
          My Fitness App is connected
        </h1>

        <p className="text-lg text-slate-300 mb-8">
          This page confirms that VS Code, GitHub, and Vercel are connected
          correctly.
        </p>

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-left">
          <p className="mb-2">
            <strong>Local project:</strong> Desktop/MyAppProjects/FitnessApp
          </p>
          <p className="mb-2">
            <strong>GitHub repo:</strong> HenryG-code/MyFitnessApp
          </p>
          <p>
            <strong>Vercel project:</strong> my-fitness-app
          </p>
        </div>
      </section>
    </main>
  );
}
