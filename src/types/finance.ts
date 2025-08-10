// src/types/finance.ts
export interface Sale {
    id: string;
    flavor: string;
    size: string;
    type: string;
  
    paymentMethod: "cash" | "transfer" | string;
  
    // Monto y cantidad pueden venir en dos campos distintos según el origen del dato
    valor?: number;      // ej. 30000
    amount?: number;     // ej. 20000
  
    cantidad?: number;   // ej. 1
    quantity?: number;   // ej. 1
  
    // Campos opcionales que ya vi en tus datos
    isPayment?: boolean;
    deductedFromStock?: boolean;
    orderDate?: string;
    totalPayment?: boolean;
  }
  
  export interface Expense {
    description: string;
    paymentMethod: "cash" | "transfer" | string;
    value: number;
  }