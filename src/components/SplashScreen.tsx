"use client";

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/15 blur-[60px] animate-pulse-glow" />

      {/* Moon emoji */}
      <div className="text-7xl mb-4 animate-fade-in-up">
        {"\u{1F319}"}
      </div>

      {/* Title */}
      <h1 className="text-5xl font-extrabold text-white tracking-tighter animate-fade-in-up-delay-1">
        my mood
      </h1>

      {/* Subtitle */}
      <p className="text-white/40 text-sm mt-3 tracking-[3px] uppercase animate-fade-in-up-delay-2">
        Stop scrolling, start living
      </p>
    </div>
  );
}
