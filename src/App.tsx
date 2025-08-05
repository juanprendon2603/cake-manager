import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { StockHome } from "./pages/stock/StockHome";
import { AddStockForm } from "./pages/stock/AddStockForm";
import { ProductList } from "./pages/stock/ProductList";
import { Sales } from "./pages/sales/Sales";
import { AddSale } from "./pages/sales/AddSale";
import { AddExpense } from "./pages/sales/AddExpense";
import { AddPayment } from "./pages/sales/AddPayment"; // Importa AddPayment
import { DailySummary } from "./pages/summary/DailySummary";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stock" element={<StockHome />} />
        <Route path="/stock/agregar" element={<AddStockForm />} />
        <Route path="/stock/listado" element={<ProductList />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/sales/add-sale" element={<AddSale />} />
        <Route path="/sales/add-payment" element={<AddPayment />} /> {/* Ruta para abonos */}
        <Route path="/sales/add-expense" element={<AddExpense />} />
        <Route path="/summary" element={<DailySummary />} />
      </Routes>
    </BrowserRouter>
  );
}