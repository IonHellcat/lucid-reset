const DefogLogo = ({ size = "lg" }: { size?: "sm" | "lg" }) => {
  const textClass = size === "lg" ? "text-4xl" : "text-xl";
  return (
    <span className={`font-display font-bold tracking-[0.1em] lowercase ${textClass}`}>
      def<span className="relative inline-block">
        <span className="text-primary" style={{ textShadow: "0 0 12px hsl(168 60% 50% / 0.6)" }}>o</span>
      </span>g
    </span>
  );
};

export default DefogLogo;
