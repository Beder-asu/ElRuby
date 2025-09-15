// Simple script to replace English data with Arabic data
// Make sure to stop your Next.js development server before running this

async function updateData() {
    console.log('Starting data update...')

    // Import Supabase dynamically
    const { createClient } = await import('@supabase/supabase-js')

    const supabaseUrl = 'https://oxhozgvrlklkckeunjtv.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aG96Z3ZybGtsa2NrZXVuanR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTM2MDAsImV4cCI6MjA3MjkyOTYwMH0.J_achIbHzZ2PHcERJCyUqHbviHKIEQrmkEHe1UHYcZs'

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        console.log('Clearing existing data...')

        // Clear in proper order
        await supabase.from('order_items').delete().gte('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('orders').delete().gte('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('products').delete().gte('id', '00000000-0000-0000-0000-000000000000')
        await supabase.from('customers').delete().gte('id', '00000000-0000-0000-0000-000000000000')

        console.log('Inserting Arabic customers...')
        const { error: customersError } = await supabase.from('customers').insert([
            { name: 'محمد أحمد', email: 'mohammed.ahmed@email.com', phone: '+966-5XX-XXXX', address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية', balance: 500.00 },
            { name: 'فاطمة علي', email: 'fatima.ali@email.com', phone: '+966-5XX-XXXX', address: 'شارع الأمير محمد، جدة، المملكة العربية السعودية', balance: 250.50 },
            { name: 'عبدالله محمد', email: 'abdullah.m@email.com', phone: '+966-5XX-XXXX', address: 'شارع الستين، الدمام، المملكة العربية السعودية', balance: 700.25 },
        ])
        if (customersError) throw customersError

        console.log('Inserting Arabic products...')
        const { error: productsError } = await supabase.from('products').insert([
            { name: 'سماعات لاسلكية', description: 'سماعات بلوتوث عالية الجودة', sku: 'WH-001', price: 349.99, stock_quantity: 25, low_stock_threshold: 5, category: 'إلكترونيات' },
            { name: 'كوب قهوة', description: 'كوب سيراميك للقهوة', sku: 'MUG-001', price: 45.50, stock_quantity: 50, low_stock_threshold: 10, category: 'أدوات منزلية' },
            { name: 'دفتر ملاحظات', description: 'دفتر ملاحظات حلزوني', sku: 'NB-001', price: 19.99, stock_quantity: 100, low_stock_threshold: 20, category: 'مستلزمات مكتبية' },
        ])
        if (productsError) throw productsError

        console.log('✅ Data updated successfully!')

    } catch (error) {
        console.error('❌ Error:', error)
    }
}

updateData()
