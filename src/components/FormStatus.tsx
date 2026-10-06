import type { FormState } from "@/server/form-state";

/** Live region announcing a form's success or error message. */
export function FormStatus({ state, className = "" }: { state: FormState; className?: string }) {
  const tone = state.status === "success" ? "text-paper" : "text-accent";
  return (
    <p role="status" aria-live="polite" className={`text-sm font-semibold ${tone} ${className}`}>
      {state.status === "success" && (
        <span aria-hidden="true" className="mr-2 text-accent">
          ✓
        </span>
      )}
      {state.message}
    </p>
  );
}
