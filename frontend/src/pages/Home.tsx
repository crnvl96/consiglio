import { useState } from "react";
import classNames from "classnames";

export function Home() {
  const [count, setCount] = useState(0);

  const btnClass = classNames("btn", {
    "opacity-50": count >= 10,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold text-tokyonight-night-blue">
        Consiglio
      </h1>
      <button onClick={() => setCount((c) => c + 1)} className={btnClass}>
        Count: {count}
      </button>
    </div>
  );
}
