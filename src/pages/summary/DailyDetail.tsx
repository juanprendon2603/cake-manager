// DailyDetail.tsx
interface Sale {
    cantidad: number;
    flavor: string;
    id: string;
    paymentMethod: string;
    size: string;
    type: string;
    valor: number;
  }
  
  interface Expense {
    description: string;
    paymentMethod: string;
    value: number;
  }
  
  interface DailyDetailProps {
    fecha: string;
    sales: Sale[];
    expenses: Expense[];
    onClose: () => void;
  }
  
  export function DailyDetail({ fecha, sales, expenses, onClose }: DailyDetailProps) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Detalle del día {fecha}</h2>
          <button onClick={onClose} className="text-red-500 font-bold">Cerrar</button>
        </div>
  
        <h3 className="text-lg font-semibold mb-2">Ventas y abonos</h3>
        <table className="w-full mb-4">
          <thead>
            <tr className="bg-pink-100">
              <th className="p-2">Cantidad</th>
              <th className="p-2">Sabor</th>
              <th className="p-2">Tamaño</th>
              <th className="p-2">Tipo</th>
              <th className="p-2">Método</th>
              <th className="p-2">Valor</th>
              <th className="p-2">Tipo Registro</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td className="p-2">{s.cantidad ?? s.quantity}</td>
                <td className="p-2">{s.flavor}</td>
                <td className="p-2">{s.size}</td>
                <td className="p-2">{s.type}</td>
                <td className="p-2">{s.paymentMethod}</td>
                <td className="p-2">
                  $
                  {(s.valor ?? s.amount)?.toLocaleString() ?? "0"}
                </td>
                <td className="p-2">
                  {s.isPayment ? "Abono" : "Venta"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        <h3 className="text-lg font-semibold mb-2">Gastos</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Descripción</th>
              <th className="p-2">Método</th>
              <th className="p-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, idx) => (
              <tr key={idx}>
                <td className="p-2">{e.description}</td>
                <td className="p-2">{e.paymentMethod}</td>
                <td className="p-2">${e.value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  