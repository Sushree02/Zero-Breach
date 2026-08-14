import { useEffect, useState } from 'react';

const STEPS = [
  'Validating target',
  'Resolving information',
  'Checking threat intelligence',
  'Building report',
];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto py-10">
      <p className="mono text-sm text-text-muted mb-4">Investigating target...</p>
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = i < activeStep;
          const current = i === activeStep;
          return (
            <div key={step} className="flex items-center gap-3 text-sm">
              <span
                className={`mono w-4 ${
                  done ? 'text-accent' : current ? 'text-accent animate-pulse' : 'text-text-muted'
                }`}
              >
                {done ? '✓' : current ? '●' : '○'}
              </span>
              <span className={done || current ? 'text-text' : 'text-text-muted'}>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
