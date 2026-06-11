import { BrowserRouter, Routes, Route } from "react-router-dom";

// Common components
import ScrollToTop from "./components/common/ScrollToTop";
import ScrollToTopButton from "./components/common/ScrollToTopButton";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages
import UVMAcademy from "./pages/UVMAcademy";
import UVMDriverMastery from "./pages/UVMDriverMastery";

// Routes
import { moduleRoutes } from "./routes/moduleRoutes";

function App() {
  return (
    <BrowserRouter>
      {/* Used to Scroll to top of the page */}
      <ScrollToTop />

      {/* This is a scroll to top button */}
      <ScrollToTopButton />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<UVMAcademy />} />

          <Route path="/driver-mastery" element={<UVMDriverMastery />} />

          {moduleRoutes.map((Module, index) => (
            <Route
              key={index}
              path={`/driver-mastery/module${index}`}
              element={<Module />}
            />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
