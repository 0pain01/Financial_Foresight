import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/dashboard";
import TransactionsPage from "@/pages/transactions";
import BillsPage from "@/pages/bills";
import AnalyticsPage from "@/pages/analytics";
import AIInsightsPage from "@/pages/ai-insights";
import InvestmentsPage from "@/pages/investments";
import ImportDataPage from "@/pages/import-data";
import SettingsPage from "@/pages/settings";
import ProfilePage from "@/pages/profile";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      {/* Protected routes */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/transactions">
        <ProtectedRoute>
          <TransactionsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/bills">
        <ProtectedRoute>
          <BillsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <AnalyticsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/ai-insights">
        <ProtectedRoute>
          <AIInsightsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/investments">
        <ProtectedRoute>
          <InvestmentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/import-data">
        <ProtectedRoute>
          <ImportDataPage />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/profile">
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <SettingsProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </AuthProvider>
          </SettingsProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;