import { courses } from "../data/courses";
import CourseCard from "../components/CourseCard";
import Navbar from "../components/layout/Navbar";

export default function Landing() {
  return (
    
    <section className="min-h-screen bg-[#020817]">
        <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold text-white">
            Verification Academy
          </h1>

          <p className="mt-5 text-xl text-slate-400">
            Choose your learning path
          </p>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
}
