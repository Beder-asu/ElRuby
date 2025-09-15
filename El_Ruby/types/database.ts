// TypeScript interfaces matching the exact database schema

// Core business entities
export interface Customer {
    id: string;
    name: string;
    phone?: string;
    balance: number;
    notes?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    cost: number;
    stock_quantity: number;
    low_stock_threshold: number;
    category?: string;
    supplier?: string;
}

export interface Company {
    id: string;
    name: string;
    phone?: string;
    description?: string;
    products_description?: string;
    balance: number;
}

// Order management
export interface Order {
    id: string;
    order_number: string;
    customer_id?: string;
    total_amount: number;
    paid_amount: number;
    notes?: string;
    created_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price?: number;
    total_amount?: number;
    quantity_change?: number;
}

// Extended interfaces with joined data
export interface OrderWithCustomer extends Order {
    customers?: Customer;
}

export interface OrderWithItems extends Order {
    order_items?: (OrderItem & {
        products?: Product;
    })[];
}

export interface OrderItemWithProduct extends OrderItem {
    products?: Product;
}

// Payments
export interface Payment {
    id: string;
    order_id?: string;
    customer_id?: string;
    amount: number;
    payment_method: 'cash' | 'customer_balance' | 'credit_card' | 'debit_card';
    reference_number?: string;
    notes?: string;
    created_at: string;
}

// Transaction history
export interface CustomerTransaction {
    id: string;
    customer_id?: string;
    order_id?: string;
    payment_id?: string;
    invoice_number: string;
    transaction_date: string;
    amount_paid: number;
    balance_after: number;
    payment_method: string;
    transaction_type: 'order' | 'payment' | 'adjustment' | 'refund';
    description?: string;
}

// Inventory management
export interface InventoryPurchase {
    id: string;
    company_id?: string;
    total_amount: number;
    paid_amount: number;
    status: string;
    notes?: string;
    created_at: string;
    updated_at?: string;
    amount_paid?: number;
}

export interface InventoryPurchaseItem {
    id: string;
    purchase_id?: string;
    product_id?: string;
    quantity: number;
    cost_per_unit: number;
    created_at: string;
    total_price?: number;
    company_id?: string;
    total_cost?: number;
    amount_paid?: number;
}

export interface InventoryTransaction {
    id: string;
    product_id?: string;
    quantity_change: number;
    reference_id?: string;
    notes?: string;
    created_at: string;
    total_price?: number;
    amount_paid?: number;
}

// Company transactions (payments to suppliers)
export interface CompanyTransaction {
    id: string;
    company_id?: string;
    purchase_id?: string;
    amount: number;
    payment_method: string;
    notes?: string;
    balance_after: number;
    created_at: string;
}

// Extended interfaces with joined data for UI
export interface InventoryPurchaseWithCompany extends InventoryPurchase {
    companies?: Company;
}

export interface InventoryPurchaseWithItems extends InventoryPurchase {
    inventory_purchase_items?: (InventoryPurchaseItem & {
        products?: Product;
    })[];
}

export interface InventoryPurchaseItemWithProduct extends InventoryPurchaseItem {
    products?: Product;
}

export interface InventoryTransactionWithProduct extends InventoryTransaction {
    products?: Product;
}

export interface CompanyTransactionWithCompany extends CompanyTransaction {
    companies?: Company;
}

export interface CompanyTransactionWithPurchase extends CompanyTransaction {
    inventory_purchases?: InventoryPurchase;
}

// Utility types for forms and UI
export interface CreateCustomerData {
    name: string;
    phone?: string;
    balance?: number;
    notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
    id: string;
}

export interface CreateProductData {
    name: string;
    description?: string;
    price: number;
    cost?: number;
    stock_quantity?: number;
    low_stock_threshold?: number;
    category?: string;
    supplier?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
    id: string;
}

export interface CreateCompanyData {
    name: string;
    phone?: string;
    description?: string;
    products_description?: string;
    balance?: number;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
    id: string;
}

export interface CreateOrderData {
    customer_id?: string;
    notes?: string;
    items: {
        product_id: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }[];
}

export interface CreatePaymentData {
    order_id?: string;
    customer_id?: string;
    amount: number;
    payment_method: 'cash' | 'customer_balance' | 'credit_card' | 'debit_card';
    notes?: string;
}

export interface CreateInventoryPurchaseData {
    company_id?: string;
    notes?: string;
    items: {
        product_id: string;
        quantity: number;
        cost_per_unit: number;
    }[];
}

export interface CreateInventoryTransactionData {
    product_id?: string;
    quantity_change: number;
    reference_id?: string;
    notes?: string;
}

// Dashboard and reporting types
export interface DashboardStats {
    customerCount: number;
    productCount: number;
    orderCount: number;
    companyCount: number;
    totalRevenue: number;
    totalCustomerBalances: number;
    totalCompanyBalances: number;
    lowStockProducts: number;
}

export interface LowStockProduct extends Product {
    is_low_stock: boolean;
}

// Search and filter types
export interface CustomerFilter {
    searchTerm?: string;
    hasBalance?: boolean;
}

export interface ProductFilter {
    searchTerm?: string;
    category?: string;
    supplier?: string;
    lowStock?: boolean;
}

export interface OrderFilter {
    searchTerm?: string;
    customer_id?: string;
    date_from?: string;
    date_to?: string;
}

export interface CompanyFilter {
    searchTerm?: string;
    hasBalance?: boolean;
}

export interface InventoryPurchaseFilter {
    searchTerm?: string;
    company_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
}

// API response types
export interface ApiResponse<T> {
    data: T | null;
    error: any;
    count?: number;
}

// Computed value helpers (client-side functions)
export const computeOrderRemainingAmount = (total: number, paid: number): number => {
    return (total || 0) - (paid || 0);
};

export const computeOrderStatus = (total: number, paid: number): 'pending' | 'completed' => {
    return (paid || 0) >= (total || 0) ? 'completed' : 'pending';
};

export const computePaymentStatus = (total: number, paid: number): 'unpaid' | 'partial' | 'paid' => {
    const paidAmount = paid || 0;
    const totalAmount = total || 0;

    if (paidAmount === 0) return 'unpaid';
    if (paidAmount >= totalAmount) return 'paid';
    return 'partial';
};

export const computeInventoryPurchaseRemainingAmount = (total: number, paid: number): number => {
    return (total || 0) - (paid || 0);
};

export const computeInventoryPurchaseStatus = (status: string): 'pending' | 'completed' | 'cancelled' => {
    return status as 'pending' | 'completed' | 'cancelled' || 'pending';
};

export const computeOrderItemTotalPrice = (unitPrice: number, quantity: number): number => {
    return (unitPrice || 0) * (quantity || 0);
};

export const computeInventoryPurchaseItemTotalCost = (costPerUnit: number, quantity: number): number => {
    return (costPerUnit || 0) * (quantity || 0);
};

export const computeOrderTotalFromItems = (items: OrderItem[]): number => {
    return items.reduce((total, item) => total + (item.total_amount || 0), 0);
};

export const computeInventoryPurchaseTotalFromItems = (items: InventoryPurchaseItem[]): number => {
    return items.reduce((total, item) => {
        return total + computeInventoryPurchaseItemTotalCost(item.cost_per_unit, item.quantity);
    }, 0);
};

export const isLowStock = (product: Product): boolean => {
    return product.stock_quantity <= product.low_stock_threshold;
};