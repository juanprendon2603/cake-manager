export interface Sale {
    id: string;
    flavor: string;
    size: string;
    type: string;
  
    paymentMethod: "cash" | "transfer" | string;
  
    valor?: number;      
    amount?: number;     
  
    cantidad?: number;   
    quantity?: number;   
  
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