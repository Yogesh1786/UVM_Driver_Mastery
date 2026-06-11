import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { FaLock } from "react-icons/fa";

export default function CourseCard({ course, index }) {
  const { title, description, icon: Icon, path, available } = course;
  const cardRef = useRef(null);

  // Mouse vector tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics mapping for smooth structural transitions
  const springX = useSpring(mouseX, { stiffness: 150, damping: 22 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 22 });

  // Map mouse positions to 3D degree tilts (-8 to 8 deg)
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (!cardRef.current || !available) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Compute normalized coordinates center-relative (-0.5 to 0.5)
    const width = rect.width;
    const height = rect.height;
    const currentX = (e.clientX - rect.left) / width - 0.5;
    const currentY = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(currentX);
    mouseY.set(currentY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // --- STATE A: Coming Soon / Unavailable State ---
  if (!available) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
        className="rounded-3xl border border-slate-900 bg-slate-900/30 p-8 flex flex-col justify-between items-start select-none relative overflow-hidden group min-h-85"
      >
        <div className="w-full">
          <div className="flex justify-between items-center w-full">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/40 flex items-center justify-center border border-slate-800 text-slate-500">
              <Icon className="w-6 h-6" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              <FaLock size={10} /> Lock
            </span>
          </div>

          <h3 className="mt-8 text-2xl font-bold text-slate-500 tracking-tight">
            {title}
          </h3>
          <p className="mt-3 text-slate-600 text-sm leading-relaxed font-light">
            {description}
          </p>
        </div>

        <span className="mt-8 px-4 py-1.5 rounded-xl border border-slate-800 bg-slate-900/50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Coming Soon
        </span>
      </motion.div>
    );
  }

  // --- STATE B: Active / 3D Tilt Interactive State ---
  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative group rounded-3xl bg-linear-to-b from-[#081323]/90 to-[#030b16]/90 border border-slate-800/80 p-1 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_20px_50px_rgba(139,92,246,0.12)] min-h-85"
    >
      <Link
        to={path}
        className="p-7 h-full w-full flex flex-col justify-between items-start"
        style={{ transform: "translateZ(25px)" }}
      >
        <div className="w-full">
          {/* Icon Pod */}
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center border border-violet-500/10 text-violet-400 group-hover:bg-violet-600/20 group-hover:text-white group-hover:border-violet-400/20 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>

          <h3 className="mt-8 text-2xl font-bold text-slate-100 tracking-tight group-hover:text-white transition-colors">
            {title}
          </h3>

          <p className="mt-3 text-slate-400 text-sm leading-relaxed font-light group-hover:text-slate-300 transition-colors">
            {description}
          </p>
        </div>

        {/* Micro-interactive Button Trigger */}
        <div className="mt-8 w-full flex items-center justify-between group/btn text-sm font-semibold text-violet-400 group-hover:text-violet-300 transition-colors">
          <span className="flex items-center gap-1.5">
            Start Learning
            <motion.span
              className="inline-block"
              variants={{
                rest: { x: 0 },
                hover: {
                  x: 4,
                  transition: {
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 0.3,
                  },
                },
              }}
              initial="rest"
              whileHover="hover"
            >
              →
            </motion.span>
          </span>

          <div className="h-px flex-1 bg-linear-to-r from-violet-500/0 via-violet-500/20 to-transparent ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    </motion.div>
  );
}
