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
import BonusScripts from "./pages/BonusScripts";
import PremiumSuccess from "./pages/PremiumSuccess";
import AccountDashboard from "./pages/AccountDashboard";
import LinkedInGuide from "./pages/LinkedInGuide";
import ReferralProgram from "./pages/ReferralProgram";
import AdminDashboard from "./pages/AdminDashboard";
import NetworkingDashboard from "./pages/NetworkingDashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
function Router() {
  // make sure to consider if you need authentication for certain routes
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
        <Route path="/bonus-scripts" component={BonusScripts} />
        <Route path="/premium-success" component={PremiumSuccess} />
        <Route path="/account" component={AccountDashboard} />
        <Route path="/linkedin-guide" component={LinkedInGuide} />
        <Route path="/referral" component={ReferralProgram} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/networking" component={NetworkingDashboard} />
        <Route path="/resume-builder" component={ResumeBuilder} />
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
