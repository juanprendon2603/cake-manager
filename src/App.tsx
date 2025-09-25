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

import { AdminRoute } from "./components/AdminRoute";
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
            {/* PÚBLICA */}
            <Route path="/login" element={<Login />} />

            {/* PRIVADAS (requieren sesión) */}
            <Route element={<RequireAuth />}>
              <Route path="/" element={<Home />} />

              {/* --- RUTAS ADMIN --- */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/allowlist"
                element={
                  <AdminRoute>
                    <AllowlistAdmin />
                  </AdminRoute>
                }
              />

              {/* Ejemplos de futuras pantallas admin */}
              <Route
                path="/admin/fridges"
                element={
                  <AdminRoute>
                    <FridgesAdmin />
                  </AdminRoute>
                }
              />
              <Route path="/admin/workers" element={<WorkersAdmin />} />

              <Route path="/admin/catalog" element={<CategoriesAdmin />} />

              {/* --- RUTAS YA EXISTENTES --- */}
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

              <Route
                path="/payment-management"
                element={<PaymentManagement />}
              />
              <Route path="/payment-management/add" element={<AddPayment />} />
              <Route
                path="/payment-management/finalize"
                element={<FinalizePayment />}
              />

              <Route path="/payroll" element={<Payroll />} />
              <Route path="/payroll-simple" element={<PayrollSimple />} />
              <Route path="/inform" element={<Inform />} />
              <Route
                path="/fridgeTemperature"
                element={<FridgeTemperature />}
              />
            </Route>

            {/* CATCH-ALL */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </LayoutWithNavbar>
      </BrowserRouter>
    </ToastProvider>
  );
}
