import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import ResumeTips from "./pages/ResumeTips";
import InterviewScripts from "./pages/InterviewScripts";
import CoverLetterBuilder from "./pages/CoverLetterBuilder";
import ScamChecker from "./pages/ScamChecker";
import JobResources from "./pages/JobResources";
import Affirmations from "./pages/Affirmations";
import JobTracker from "./pages/JobTracker";
import SalaryNegotiation from "./pages/SalaryNegotiation";
import SuccessStories from "./pages/SuccessStories";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/resume-tips" component={ResumeTips} />
        <Route path="/interview-scripts" component={InterviewScripts} />
        <Route path="/cover-letter" component={CoverLetterBuilder} />
        <Route path="/scam-checker" component={ScamChecker} />
        <Route path="/job-resources" component={JobResources} />
        <Route path="/affirmations" component={Affirmations} />
        <Route path="/job-tracker" component={JobTracker} />
        <Route path="/salary-negotiation" component={SalaryNegotiation} />
        <Route path="/success-stories" component={SuccessStories} />
        <Route component={Home} />
      </Switch>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
