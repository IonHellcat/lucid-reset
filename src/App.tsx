import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Stats from "./pages/Stats.tsx";
import ColorSort from "./pages/activities/ColorSort.tsx";
import SequenceRecall from "./pages/activities/SequenceRecall.tsx";
import RhythmTap from "./pages/activities/RhythmTap.tsx";
import FlowTrace from "./pages/activities/FlowTrace.tsx";
import Breathe from "./pages/activities/Breathe.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "bg-card text-foreground border-border",
        },
      }}
    />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/activity/color-sort" element={<ColorSort />} />
        <Route path="/activity/sequence-recall" element={<SequenceRecall />} />
        <Route path="/activity/rhythm-tap" element={<RhythmTap />} />
        <Route path="/activity/flow-trace" element={<FlowTrace />} />
        <Route path="/activity/breathe" element={<Breathe />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
