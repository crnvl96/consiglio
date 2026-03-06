import { useState } from "react";

function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold text-tokyonight-night-blue">
        Consiglio
      </h1>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 rounded-lg bg-tokyonight-night-blue0 text-tokyonight-night-fg hover:bg-tokyonight-night-blue transition-colors"
      >
        Count: {count}
      </button>
    </div>
  );
}

export default Home;
