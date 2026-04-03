const LucidLogo = ({ size = "lg" }: { size?: "sm" | "lg" }) => {
  const textClass = size === "lg" ? "text-4xl" : "text-xl";
  return (
    <span className={`font-mono font-bold tracking-[0.15em] lowercase ${textClass}`}>
      luc<span className="relative">i<span className="absolute -top-[0.05em] left-[0.15em] w-[0.25em] h-[0.25em] rounded-full bg-primary" /></span>d
    </span>
  );
};

export default LucidLogo;
