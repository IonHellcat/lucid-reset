import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Stats from "./pages/Stats.tsx";
import ColorSort from "./pages/activities/ColorSort.tsx";
import SequenceRecall from "./pages/activities/SequenceRecall.tsx";
import RhythmTap from "./pages/activities/RhythmTap.tsx";
import FlowTrace from "./pages/activities/FlowTrace.tsx";
import Breathe from "./pages/activities/Breathe.tsx";
import TypingTest from "./pages/activities/TypingTest.tsx";
import NotFound from "./pages/NotFound.tsx";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in">
      <Routes location={location}>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/activity/color-sort" element={<ColorSort />} />
        <Route path="/activity/sequence-recall" element={<SequenceRecall />} />
        <Route path="/activity/rhythm-tap" element={<RhythmTap />} />
        <Route path="/activity/flow-trace" element={<FlowTrace />} />
        <Route path="/activity/breathe" element={<Breathe />} />
        <Route path="/activity/typing-test" element={<TypingTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <>
    <Toaster
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-card text-foreground border-border",
        },
      }}
    />
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  </>
);

export default App;
