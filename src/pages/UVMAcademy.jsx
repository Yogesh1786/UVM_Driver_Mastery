import { courses } from "../data/courses";
import CourseCard from "../components/CourseCard";
import { motion } from "framer-motion";

export default function UVMAcademy() {
  return (
    <section className="relative min-h-screen bg-[#020817] text-white overflow-hidden font-sans">

      {/* --- Cyber-Grid Background Layer --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_10%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* High-End Ambient Purple Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-[350px] bg-linear-to-r from-violet-600/10 to-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-28">
        {/* Animated Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />{" "}
            E-Learning Platform
          </span>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight bg-clip-text bg-linear-to-b from-white via-slate-100 to-slate-400">
            UVM Academy
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Master complex testbench engineering. Choose your strategic learning
            path and construct production-grade environments.
          </p>
        </motion.div>

        {/* Dynamic Grid Layout */}
        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
