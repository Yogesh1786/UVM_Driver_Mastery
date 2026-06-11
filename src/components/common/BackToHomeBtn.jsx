import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function BackToHomeBtn({ to = "/" }) {
  const navigate = useNavigate();

  const handleNavigation = (e) => {
    // If target is explicitly -1, intercept the standard <Link> thread and pop history instead
    if (to === -1) {
      e.preventDefault();
      navigate(-1);
    }
  };

  return (
    <div className="inline-block group mb-6 lg:hidden">
      <motion.button
        onClick={handleNavigation}
        whileHover="hover"
        whileTap={{ scale: 0.96 }}
        className="
          inline-flex 
          items-center 
          gap-2 
          px-3 
          py-1.5 
          rounded-xl 
          border 
          border-slate-800/60 
          bg-slate-900/30 
          backdrop-blur-sm 
          text-xs 
          font-medium 
          text-slate-400 
          hover:text-violet-400 
          hover:border-violet-500/30 
          hover:bg-violet-500/5 
          transition-colors 
          duration-300
          cursor-pointer
        "
      >
        {/* Animated Arrow that slides left slightly on container hover */}
        <motion.span
          variants={{
            rest: { x: 0 },
            hover: { x: -3 },
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center"
        >
          <ArrowLeft size={12} />
        </motion.span>

        <span>{to === -1 ? "Go Back" : "Back to Home"}</span>
      </motion.button>
    </div>
  );
}
