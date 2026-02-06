import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import OverviewCards from "@/components/dashboard/overview-cards";
import SpendingChart from "@/components/dashboard/spending-chart";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import UtilityBills from "@/components/dashboard/utility-bills";
import QuickActions from "@/components/dashboard/quick-actions";
import FinancialHealthScore from "@/components/dashboard/financial-health-score";
import NetWorthProjection from "@/components/dashboard/net-worth-projection";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import AddTransactionModal from "@/components/modals/add-transaction-modal";
import CSVUploadModal from "@/components/modals/csv-upload-modal";
import AddBillModal from "@/components/modals/add-bill-modal";
import BudgetModal from "@/components/modals/budget-modal";
import { useState } from "react";

export default function Dashboard() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back, John!</h1>
            <p className="text-muted-foreground">Here's your financial overview for this month.</p>
          </div>

          {/* Overview Cards */}
          <OverviewCards />

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <SpendingChart />
            </div>
            <CategoryBreakdown />
          </div>

          {/* Utility Bills */}
          <UtilityBills onAddBill={() => setIsBillModalOpen(true)} />

          {/* Quick Actions and AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <QuickActions 
              onAddTransaction={() => setIsTransactionModalOpen(true)}
              onUploadCSV={() => setIsCSVModalOpen(true)}
              onSetBudget={() => setIsBudgetModalOpen(true)}
            />
            <FinancialHealthScore />
            <NetWorthProjection />
          </div>

          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
      </main>

      {/* Modals */}
      <AddTransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
      <CSVUploadModal 
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
      />
      <AddBillModal 
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
      />
      <BudgetModal 
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />
    </div>
  );
}