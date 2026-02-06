import { Link, useLocation } from "wouter";
import { BarChart3, Home, Receipt, PieChart, Sprout, Bot, Upload, Settings, CreditCard } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const getNavItemClass = (path: string) => {
    const isActive = location === path;
    return isActive
      ? "bg-finance-blue bg-opacity-10 border-r-4 border-finance-blue text-finance-blue flex items-center px-6 py-3 text-sm font-medium"
      : "text-foreground hover:bg-muted flex items-center px-6 py-3 text-sm font-medium";
  };

  return (
    <aside className="w-64 bg-card shadow-lg hidden lg:block">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-finance-blue rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">FinanceTracker</h1>
            <p className="text-sm text-muted-foreground">Pro</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-6 py-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main</h3>
        </div>
        <div className="space-y-1">
          <Link href="/" className={getNavItemClass("/")}>
            <Home className="mr-3 h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/transactions" className={getNavItemClass("/transactions")}>
            <CreditCard className="mr-3 h-4 w-4" />
            Transactions
          </Link>
          <Link href="/bills" className={getNavItemClass("/bills")}>
            <Receipt className="mr-3 h-4 w-4" />
            Bills & Utilities
          </Link>
          <Link href="/analytics" className={getNavItemClass("/analytics")}>
            <PieChart className="mr-3 h-4 w-4" />
            Analytics
          </Link>
          <Link href="/investments" className={getNavItemClass("/investments")}>
            <Sprout className="mr-3 h-4 w-4" />
            Investments
          </Link>
        </div>
        
        <div className="px-6 py-3 mt-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</h3>
        </div>
        <div className="space-y-1">
          <Link href="/insights" className={getNavItemClass("/insights")}>
            <Bot className="mr-3 h-4 w-4" />
            Insights
          </Link>
          <Link href="/import-data" className={getNavItemClass("/import-data")}>
            <Upload className="mr-3 h-4 w-4" />
            Import Data
          </Link>
          <Link href="/settings" className={getNavItemClass("/settings")}>
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
        </div>
      </nav>
    </aside>
  );
}