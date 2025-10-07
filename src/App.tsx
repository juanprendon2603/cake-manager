// src/App.tsx
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ToastProvider } from "./components/Alert";
import { Navbar } from "./components/Navbar";
import RequireAuth from "./components/RequireAuth";

// Solo usamos AdminGate (no hay otros roles)
import AdminGate from "./components/AdminRoute";

import { Home } from "./pages/Home";
import AdminPanel from "./pages/admin/AdminPanel";
import AllowlistAdmin from "./pages/admin/Allowlist";
import FridgesAdmin from "./pages/admin/FridgesAdmin";
import WorkersAdmin from "./pages/admin/WorkersAdmin";
import CategoriesAdmin from "./pages/admin/categories";
import Login from "./pages/auth/Login";
import { Inform } from "./pages/inform/Inform";
import { AddPayment } from "./pages/payments/AddPayment";
import { FinalizePayment } from "./pages/payments/FinalizePayment";
import { PaymentManagement } from "./pages/payments/PaymentManagement";
import FridgeTemperature from "./pages/payroll/FridgeTemperature";
import Payroll from "./pages/payroll/Payroll";
import PayrollSimple from "./pages/payroll/PayrollSimple";
import { AddExpense } from "./pages/sales/AddExpense";
import { AddGeneralExpense } from "./pages/sales/AddGeneralExpense";
import AddSale from "./pages/sales/AddSale";
import { Sales } from "./pages/sales/Sales";
import { AddStockForm } from "./pages/stock/AddStockForm";
import { ProductList } from "./pages/stock/ProductList";
import { StockHome } from "./pages/stock/StockHome";
import { DailyDetailPage } from "./pages/summary/DailyDetailPage";
import { DailySummary } from "./pages/summary/DailySummary";
import { DailyTodayRedirect } from "./pages/summary/DailyTodayRedirect";

function LayoutWithNavbar({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <>
      {pathname !== "/login" && <Navbar />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <LayoutWithNavbar>
          <Routes>
            {/* --- PÚBLICA --- */}
            <Route path="/login" element={<Login />} />

            {/* --- PRIVADAS (requieren sesión) --- */}
            <Route element={<RequireAuth />}>
              {/* Acceso para cualquier usuario autenticado */}
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
              <Route path="/daily" element={<DailyTodayRedirect />} />

              <Route path="/daily/:fecha" element={<DailyDetailPage />} />

              {/* Payroll SIMPLE: abierta para todos los autenticados */}
              <Route path="/payroll-simple" element={<PayrollSimple />} />

              {/* Otras privadas abiertas (no admin) */}
              <Route
                path="/payment-management"
                element={<PaymentManagement />}
              />
              <Route path="/payment-management/add" element={<AddPayment />} />
              <Route
                path="/payment-management/finalize"
                element={<FinalizePayment />}
              />
              <Route
                path="/fridgeTemperature"
                element={<FridgeTemperature />}
              />

              {/* --- SOLO ADMIN: /admin/* completo --- */}
              <Route path="/admin" element={<AdminGate />}>
                <Route index element={<AdminPanel />} />
                <Route path="allowlist" element={<AllowlistAdmin />} />
                <Route path="fridges" element={<FridgesAdmin />} />
                <Route path="workers" element={<WorkersAdmin />} />
                <Route path="catalog" element={<CategoriesAdmin />} />
              </Route>

              {/* --- SOLO ADMIN: rutas específicas fuera de /admin --- */}
              <Route element={<AdminGate />}>
                {/* Inform solo para admin */}
                <Route path="/inform" element={<Inform />} />

                {/* Payroll (NO la simple) solo para admin */}
                <Route path="/payroll" element={<Payroll />} />

                {/* Summary y vistas relacionadas solo para admin */}
                <Route path="/summary" element={<DailySummary />} />
              </Route>
            </Route>

            {/* --- CATCH-ALL --- */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </LayoutWithNavbar>
      </BrowserRouter>
    </ToastProvider>
  );
}
