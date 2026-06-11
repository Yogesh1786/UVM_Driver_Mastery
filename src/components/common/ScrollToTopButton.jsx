import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(32); // bottom-8 default is 32px

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);

      const totalPageHeight = document.documentElement.scrollHeight;
      const scrollPosition = window.scrollY + window.innerHeight;
      const distanceFromBottom = totalPageHeight - scrollPosition;

      // FIXED: Adjusted layout collision threshold so it docks closely to the bottom metrics
      const footerThreshold = 1;

      if (distanceFromBottom < footerThreshold) {
        const adjustment = footerThreshold - distanceFromBottom;
        setBottomOffset(32 + adjustment);
      } else {
        setBottomOffset(32);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            bottom: `${bottomOffset}px`,
          }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            bottom: { type: "tween", ease: "linear", duration: 0.08 },
          }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="fixed right-8 cursor-pointer z-50 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-slate-900/80 backdrop-blur-xl text-violet-400 shadow-[0_10px_30px_rgba(139,92,246,0.15)] hover:border-violet-500/50 hover:bg-violet-600 hover:text-white group"
          aria-label="Scroll to Top"
        >
          <ArrowUp
            size={20}
            className="transition-transform duration-200 group-hover:-translate-y-0.5"
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
