import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/Alert";
import { Navbar } from "./components/Navbar";
import { Home } from "./pages/Home";
import { AddPayment } from "./pages/payments/AddPayment";
import { FinalizePayment } from "./pages/payments/FinalizePayment";
import { PaymentManagement } from "./pages/payments/PaymentManagement";
import Payroll from "./pages/payroll/Payroll";
import { AddExpense } from "./pages/sales/AddExpense";
import { AddGeneralExpense } from "./pages/sales/AddGeneralExpense";
import { AddSale } from "./pages/sales/AddSale";
import { Sales } from "./pages/sales/Sales";
import { AddStockForm } from "./pages/stock/AddStockForm";
import { ProductList } from "./pages/stock/ProductList";
import { StockHome } from "./pages/stock/StockHome";
import { DailyDetailPage } from "./pages/summary/DailyDetailPage";
import { DailySummary } from "./pages/summary/DailySummary";
import { DailyTodayRedirect } from "./pages/summary/DailyTodayRedirect";
import PayrollSimple from "./pages/payroll/PayrollSimple";
import { Inform } from "./pages/inform/Inform";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stock" element={<StockHome />} />
          <Route path="/stock/agregar" element={<AddStockForm />} />
          <Route path="/stock/listado" element={<ProductList />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/add-sale" element={<AddSale />} />
          <Route path="/sales/add-expense" element={<AddExpense />} />
          <Route
            path="/sales/add-general-expense"
            element={<AddGeneralExpense />}
          />
          <Route path="/summary" element={<DailySummary />} />
          <Route path="/daily" element={<DailyTodayRedirect />} />
          <Route path="/daily/:fecha" element={<DailyDetailPage />} />
          <Route path="/payment-management" element={<PaymentManagement />} />
          <Route path="/payment-management/add" element={<AddPayment />} />
          <Route
            path="/payment-management/finalize"
            element={<FinalizePayment />}
          />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/payroll-simple" element={<PayrollSimple />} />
          <Route path="/inform" element={<Inform />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
