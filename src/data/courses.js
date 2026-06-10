import { FiCpu, FiDatabase, FiMonitor } from "react-icons/fi";

export const courses = [
  {
    id: 1,
    title: "UVM Driver Mastery",
    description:
      "Learn complete UVM Driver Architecture from beginner to advanced.",
    icon: FiCpu,
    path: "/driver",
    available: true,
  },

  {
    id: 2,
    title: "UVM Monitor Mastery",
    description: "Understand monitor design and transaction capturing.",
    icon: FiMonitor,
    path: "/monitor",
    available: false,
  },

  {
    id: 3,
    title: "UVM Scoreboard",
    description: "Learn verification using scoreboards.",
    icon: FiMonitor,
    path: "/scoreboard",
    available: false,
  },

  {
    id: 4,
    title: "Register Layer (RAL)",
    description: "Master Register Abstraction Layer.",
    icon: FiDatabase,
    path: "/ral",
    available: false,
  },
];
