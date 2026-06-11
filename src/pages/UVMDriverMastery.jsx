import { useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  FaBookOpen,
  FaProjectDiagram,
  FaExchangeAlt,
  FaMicrochip,
  FaClock,
} from "react-icons/fa";

// --- Custom 3D Tilt Card Component ---
const InteractiveCard = ({ children, to }) => {
  const cardRef = useRef(null);

  // Motion values for tracking mouse position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the movement with spring physics
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse coordinates to degrees of rotation (-10 to 10 deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    // Calculate normalized mouse positions (-0.5 to 0.5)
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative group rounded-2xl bg-linear-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-1 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)]"
    >
      <Link
        to={to}
        className="block h-full w-full"
        style={{ transform: "translateZ(30px)" }}
      >
        {children}
      </Link>
    </motion.div>
  );
};

// --- Main Page Component ---
const Home = () => {
  const navigate = useNavigate();

  const modulesRef = useRef(null);

  const scrollToModules = () => {
    modulesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const modules = [
    {
      title: "03 UVM Driver Universal Recipe",
      path: "/driver/module3",
      icon: <FaBookOpen size={24} />,
      description: "Learn the universal UVM driver architecture.",
    },
    {
      title: "04 UVM Driver Type Taxonomy Pattern Map",
      path: "/driver/module4",
      icon: <FaProjectDiagram size={24} />,
      description: "Understand driver classifications and patterns.",
    },
    {
      title: "05 UVM Driver Sequence Sequencer Driver Handshake ",
      path: "/driver/module5",
      icon: <FaExchangeAlt size={24} />,
      description: "Master request-response communication.",
    },
    {
      title: "06 UVM Driver APB Style Non Pipelined Command Driver",
      path: "/driver/module6",
      icon: <FaMicrochip size={24} />,
      description: "Build APB protocol based drivers.",
    },
    {
      title: "07 UVM Driver Timing Clocking Blocks Race Conditions",
      path: "/driver/module7",
      icon: <FaClock size={24} />,
      description: "Handle race conditions and clocking blocks.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-violet-500/30">
      {/* --- High-End Radial Glow Grid --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-87.5 bg-linear-to-r from-violet-600/20 to-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Custom smooth ease-out
        >
          {/* Subtle Tag */}
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />{" "}
            Advanced Verification Hub
          </span>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-white via-slate-200 to-slate-400">
            UVM Driver Mastery
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
            Architect solid testbenches. Master communication handshakes,
            clocking boundaries, and protocol abstraction.
          </p>

          {/* Liquid-Style Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 items-center">
            <motion.button
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(30, 41, 59, 0.8)",
              }}
              onClick={scrollToModules}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="cursor-pointer w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-slate-900/50 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              View Modules
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Modules Section */}
      <section
        ref={modulesRef}
        className="relative z-10 max-w-7xl mx-auto px-6 pb-32"
      >
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Curriculum Core
          </h2>
          <div className="h-px flex-1 bg-linear-to-r from-slate-800 to-transparent ml-6 hidden sm:block" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <InteractiveCard key={module.path} to={module.path}>
              <div className="p-6 h-full flex flex-col justify-between items-start min-h-55">
                <div className="w-full">
                  {/* Glassmorphic Icon Badge */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 w-fit text-violet-400 group-hover:text-white group-hover:border-violet-500/30 group-hover:bg-violet-600/10 transition-all duration-300">
                    {module.icon}
                  </div>

                  <h3 className="text-xl font-semibold mt-5 text-slate-200 group-hover:text-white transition-colors">
                    {module.title}
                  </h3>

                  <p className="text-slate-400 text-sm mt-2 leading-relaxed font-light">
                    {module.description}
                  </p>
                </div>

                {/* Micro-interactive text layout */}
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-500 group-hover:text-violet-400 transition-colors duration-300">
                  <span>Initialize</span>
                  <span className="w-1.5 h-px bg-slate-700 group-hover:w-4 group-hover:bg-violet-400 transition-all duration-300" />
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
