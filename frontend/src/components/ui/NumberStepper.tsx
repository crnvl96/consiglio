import { useRef } from "react";
import { Button } from "./Button";

type NumberStepperProps = {
  id?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
};

export function NumberStepper({ id, min, max, defaultValue }: NumberStepperProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const step = (direction: 1 | -1) => {
    const input = inputRef.current;
    // Defensive guard: inputRef.current is always set after render, unreachable in practice.
    /* v8 ignore start */
    if (!input) return;
    /* v8 ignore stop */
    if (direction === 1) input.stepUp();
    else input.stepDown();
    input.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <div className="mx-auto flex w-fit items-center gap-0">
      <Button
        variant="ghost"
        type="button"
        onClick={() => step(-1)}
        className="rounded-r-none border-r-0"
      >
        −
      </Button>
      <input
        id={id}
        ref={inputRef}
        type="number"
        max={max}
        min={min}
        defaultValue={defaultValue}
        readOnly
        tabIndex={-1}
        className="pointer-events-none w-16 border-y border-border-muted bg-bg-dark px-2 py-2 text-center text-fg select-none focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
      />
      <Button
        variant="ghost"
        type="button"
        onClick={() => step(1)}
        className="rounded-l-none border-l-0"
      >
        +
      </Button>
    </div>
  );
}
