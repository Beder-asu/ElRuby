import { createBrowserClient } from "@supabase/ssr"
import type { Customer, Product, Order } from "@/types/database"

// Mock data for development
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
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: "2",
    order_number: "ORD000002",
    customer_id: "2",
    total_amount: 75.00,
    paid_amount: 75.00,
    notes: "تم الدفع كاملاً",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: "3",
    order_number: "ORD000003",
    customer_id: "3",
    total_amount: 125.00,
    paid_amount: 0.00,
    notes: "لم يتم الدفع بعد",
    created_at: new Date().toISOString() // now
  }
]

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oxhozgvrlklkckeunjtv.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aG96Z3ZybGtsa2NrZXVuanR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTM2MDAsImV4cCI6MjA3MjkyOTYwMH0.J_achIbHzZ2PHcERJCyUqHbviHKIEQrmkEHe1UHYcZs"

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables not found, using mock client:", {
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
          } else if (table === 'orders') {
            // Check if the query includes customer relations
            if (columns && columns.includes('customers')) {
              // Join orders with customers
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
            eq: () => Promise.resolve({ data, error: null }),
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
      rpc: (functionName: string) => {
        if (functionName === 'get_low_stock_products') {
          // Filter products where stock_quantity <= low_stock_threshold and low_stock_threshold > 0
          const lowStockProducts = mockProducts.filter(
            product => product.stock_quantity <= product.low_stock_threshold && product.low_stock_threshold > 0
          ).map(product => ({
            id: product.id,
            name: product.name,
            stock_quantity: product.stock_quantity,
            low_stock_threshold: product.low_stock_threshold,
            sku: null
          }))

          console.log("[Mock] Low stock products found:", lowStockProducts.length)
          return Promise.resolve({ data: lowStockProducts, error: null })
        }

        return Promise.resolve({ data: null, error: { message: "RPC function not found" } })
      },
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

  console.log("[v0] Creating Supabase client with URL:", supabaseUrl)
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
