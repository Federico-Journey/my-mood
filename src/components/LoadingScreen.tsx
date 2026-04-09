"use client";

type Props = {
  progress: number;
  accentColor: string;
};

export default function LoadingScreen({ progress, accentColor }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5">
      {/* Spinning icon */}
      <div
        className="text-5xl mb-8 animate-spin"
        style={{ animationDuration: "3s" }}
      >
        {"\u2728"}
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        Creo il tuo piano serata...
      </h2>
      <p className="text-white/30 text-sm mb-8">
        Analizzo mood, budget e locali a Milano
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-[280px] h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
          }}
        />
      </div>
      <p className="text-white/20 text-xs mt-3">{progress}%</p>
    </div>
  );
}
