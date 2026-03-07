import { useRef } from "react";

export function Home() {
  const inputRef = useRef<HTMLInputElement>(null);

  const step = (direction: 1 | -1) => {
    const input = inputRef.current;
    if (!input) return;
    if (direction === 1) input.stepUp();
    else input.stepDown();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-4xl font-bold text-tokyonight-night-blue">Consiglio</h1>
      <label htmlFor="slots" className="text-tokyonight-night-fg">
        Slots:{" "}
      </label>
      <div className="flex items-center gap-0">
        <button
          type="button"
          onClick={() => step(-1)}
          className="rounded-l-lg border border-r-0 border-tokyonight-night-blue0 bg-tokyonight-night-bg-highlight px-3 py-2 text-tokyonight-night-fg transition-colors hover:bg-tokyonight-night-blue0"
        >
          −
        </button>
        <input
          id="slots"
          ref={inputRef}
          type="number"
          max={8}
          min={1}
          defaultValue={1}
          readOnly
          tabIndex={-1}
          className="pointer-events-none w-16 border-y border-tokyonight-night-blue0 bg-tokyonight-night-bg-dark px-2 py-2 text-center text-tokyonight-night-fg select-none focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
        />
        <button
          type="button"
          onClick={() => step(1)}
          className="rounded-r-lg border border-l-0 border-tokyonight-night-blue0 bg-tokyonight-night-bg-highlight px-3 py-2 text-tokyonight-night-fg transition-colors hover:bg-tokyonight-night-blue0"
        >
          +
        </button>
      </div>
      <button className="rounded-lg bg-tokyonight-night-blue px-6 py-2 font-semibold text-tokyonight-night-bg transition-colors hover:bg-tokyonight-night-blue-bright">
        Create new room
      </button>
    </div>
  );
}
