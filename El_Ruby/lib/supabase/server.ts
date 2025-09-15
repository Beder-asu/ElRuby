import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Customer, Product, Order } from "@/types/database"

// Mock data for development - same as client
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "أحمد محمد",
    phone: "01234567890",
    balance: 1500.00
  },
  {
    id: "2",
    name: "فاطمة علي",
    phone: "01234567891",
    balance: -500.00
  },
  {
    id: "3",
    name: "محمد حسن",
    phone: "01234567892",
    balance: 0.00
  }
]

const mockProducts: Product[] = [
  {
    id: "1",
    name: "منتج أ",
    description: "وصف المنتج الأول",
    price: 50.00,
    cost: 30.00,
    stock_quantity: 100,
    low_stock_threshold: 10,
    category: "إلكترونيات"
  },
  {
    id: "2",
    name: "منتج ب",
    description: "وصف المنتج الثاني",
    price: 75.00,
    cost: 45.00,
    stock_quantity: 5,
    low_stock_threshold: 10,
    category: "أدوات"
  },
  {
    id: "3",
    name: "منتج ج",
    description: "وصف المنتج الثالث",
    price: 25.00,
    cost: 15.00,
    stock_quantity: 0,
    low_stock_threshold: 5,
    category: "مستلزمات"
  }
]

const mockOrders: Order[] = [
  {
    id: "1",
    order_number: "ORD000001",
    customer_id: "1",
    total_amount: 200.00,
    paid_amount: 150.00,
    notes: "طلب عاجل",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    order_number: "ORD000002",
    customer_id: "2",
    total_amount: 75.00,
    paid_amount: 75.00,
    notes: "تم الدفع كاملاً",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "3",
    order_number: "ORD000003",
    customer_id: "3",
    total_amount: 125.00,
    paid_amount: 0.00,
    notes: "لم يتم الدفع بعد",
    created_at: new Date().toISOString()
  }
]

const mockOrderItems = [
  { id: "1", order_id: "1", product_id: "1", quantity: 2, unit_price: 50.00, total_price: 100.00 },
  { id: "2", order_id: "1", product_id: "2", quantity: 1, unit_price: 75.00, total_price: 75.00 },
  { id: "3", order_id: "1", product_id: "3", quantity: 1, unit_price: 25.00, total_price: 25.00 },
  { id: "4", order_id: "2", product_id: "2", quantity: 1, unit_price: 75.00, total_price: 75.00 },
  { id: "5", order_id: "3", product_id: "1", quantity: 1, unit_price: 50.00, total_price: 50.00 },
  { id: "6", order_id: "3", product_id: "2", quantity: 1, unit_price: 75.00, total_price: 75.00 }
]

const mockPayments = [
  { id: "1", order_id: "1", customer_id: "1", amount: 100.00, payment_method: "cash", created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
  { id: "2", order_id: "1", customer_id: "1", amount: 50.00, payment_method: "customer_balance", created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString() },
  { id: "3", order_id: "2", customer_id: "2", amount: 75.00, payment_method: "cash", created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() }
]

const mockCustomerTransactions = [
  { id: "1", customer_id: "1", order_id: "1", payment_id: "1", invoice_number: "INV-001", transaction_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), amount_paid: 100.00, balance_after: 1450.00, payment_method: "cash", description: "Payment for order ORD000001" },
  { id: "2", customer_id: "1", order_id: "1", payment_id: "2", invoice_number: "INV-002", transaction_date: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), amount_paid: 50.00, balance_after: 1500.00, payment_method: "customer_balance", description: "Balance payment for order ORD000001" },
  { id: "3", customer_id: "2", order_id: "2", payment_id: "3", invoice_number: "INV-003", transaction_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), amount_paid: 75.00, balance_after: -500.00, payment_method: "cash", description: "Payment for order ORD000002" }
]

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://oxhozgvrlklkckeunjtv.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aG96Z3ZybGtsa2NrZXVuanR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTM2MDAsImV4cCI6MjA3MjkyOTYwMH0.J_achIbHzZ2PHcERJCyUqHbviHKIEQrmkEHe1UHYcZs"

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables not found, using mock server client:", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
      availableEnvVars: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      },
    })

    return {
      from: (table: string) => ({
        select: (columns?: string) => {
          let data: any[] = []

          // Return mock data based on table
          if (table === 'customers') {
            data = mockCustomers
          } else if (table === 'products') {
            data = mockProducts
          } else if (table === 'customer_transactions') {
            data = mockCustomerTransactions
          } else if (table === 'orders') {
            // Handle complex order queries with relations
            if (columns && columns.includes('order_items') && columns.includes('customers')) {
              // Full order query with all relations
              data = mockOrders.map(order => ({
                ...order,
                customers: mockCustomers.find(customer => customer.id === order.customer_id) || null,
                order_items: mockOrderItems
                  .filter(item => item.order_id === order.id)
                  .map(item => ({
                    ...item,
                    products: mockProducts.find(product => product.id === item.product_id) || null
                  })),
                payments: mockPayments.filter(payment => payment.order_id === order.id)
              }))
            } else if (columns && columns.includes('customers')) {
              // Simple order query with customers only
              data = mockOrders.map(order => ({
                ...order,
                customers: mockCustomers.find(customer => customer.id === order.customer_id) || null
              }))
            } else {
              data = mockOrders
            }
          }

          return {
            lte: () => Promise.resolve({ data, error: null }),
            eq: (column: string, value: any) => {
              // Handle filtering by specific fields
              let filteredData = data
              if (table === 'orders' && column === 'id') {
                filteredData = data.filter((item: any) => item.id === value)
              } else if (table === 'customer_transactions' && column === 'customer_id') {
                filteredData = data.filter((item: any) => item.customer_id === value)
              }
              return Promise.resolve({ data: filteredData, error: null })
            },
            then: (resolve: any) => resolve({ data, error: null })
          }
        },
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      auth: {
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
        signOut: () => Promise.resolve({ error: null }),
        getUser: () => Promise.resolve({
          data: {
            user: {
              id: "mock-user-id",
              email: "test@example.com",
              name: "Test User"
            }
          },
          error: null
        }),
      },
    } as any
  }

  console.log("[v0] Creating server Supabase client with URL:", supabaseUrl)
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
