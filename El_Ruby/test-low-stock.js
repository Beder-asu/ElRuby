// Test script to check if low stock functionality works with real Supabase
import { createClient } from './lib/supabase/client.js'

async function testLowStock() {
    console.log('🔍 Testing low stock functionality...')

    const supabase = createClient()
    console.log('✅ Supabase client created')

    try {
        // Test 1: Check if RPC function exists
        console.log('\n📞 Testing RPC function get_low_stock_products...')
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_low_stock_products')

        if (rpcError) {
            console.log('❌ RPC function failed:', rpcError.message)
            console.log('💡 This means the get_low_stock_products function is not deployed to your database')
        } else {
            console.log('✅ RPC function works! Found low stock products:', rpcData?.length || 0)
            if (rpcData && rpcData.length > 0) {
                console.log('📦 Low stock products:')
                rpcData.forEach(product => {
                    console.log(`   - ${product.name}: ${product.stock_quantity}/${product.low_stock_threshold}`)
                })
            }
        }

        // Test 2: Check products table directly
        console.log('\n📊 Checking products table directly...')
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, stock_quantity, low_stock_threshold')

        if (productsError) {
            console.log('❌ Products table query failed:', productsError.message)
        } else {
            console.log(`✅ Found ${products?.length || 0} products in database`)

            if (products && products.length > 0) {
                // Filter for low stock manually
                const lowStockProducts = products.filter(
                    p => p.stock_quantity <= p.low_stock_threshold && p.low_stock_threshold > 0
                )

                console.log(`🔍 Products with low stock (manual filter): ${lowStockProducts.length}`)
                lowStockProducts.forEach(product => {
                    console.log(`   - ${product.name}: ${product.stock_quantity}/${product.low_stock_threshold} (LOW)`)
                })

                // Show all products for reference
                console.log('\n📋 All products:')
                products.forEach(product => {
                    const status = product.stock_quantity <= product.low_stock_threshold ? '🔴 LOW' : '✅ OK'
                    console.log(`   - ${product.name}: ${product.stock_quantity}/${product.low_stock_threshold} ${status}`)
                })
            }
        }

    } catch (error) {
        console.log('💥 Unexpected error:', error.message)
    }
}

testLowStock()