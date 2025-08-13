import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import TransactionsPage from "@/pages/transactions";
import BillsPage from "@/pages/bills";
import AnalyticsPage from "@/pages/analytics";
import AIInsightsPage from "@/pages/ai-insights";
import InvestmentsPage from "@/pages/investments";
import ImportDataPage from "@/pages/import-data";
import SettingsPage from "@/pages/settings";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/bills" component={BillsPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/ai-insights" component={AIInsightsPage} />
      <Route path="/investments" component={InvestmentsPage} />
      <Route path="/import-data" component={ImportDataPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
