import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.7, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 20 }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          whileHover={{
            scale: 1.08,
          }}
          whileTap={{
            scale: 0.95,
          }}
          className="
            fixed
            bottom-8
            right-8
            z-50

            flex
            h-12
            w-12
            items-center
            justify-center

            rounded-2xl

            border
            border-violet-500/30

            bg-slate-900/80
            backdrop-blur-xl

            text-violet-400

            shadow-[0_10px_30px_rgba(139,92,246,0.25)]

            transition-colors

            hover:bg-violet-600
            hover:text-white
          "
          aria-label="Scroll to Top"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
