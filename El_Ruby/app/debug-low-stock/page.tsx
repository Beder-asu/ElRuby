"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LowStockDebugPage() {
    const [debugInfo, setDebugInfo] = useState<any>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function testLowStock() {
            console.log('🔍 Testing low stock functionality...')

            const supabase = createClient()
            console.log('✅ Supabase client created')

            const results: any = {
                rpcTest: null,
                productsTest: null,
                lowStockProducts: [],
                allProducts: []
            }

            try {
                // Test 1: Check if RPC function exists
                console.log('📞 Testing RPC function get_low_stock_products...')
                const { data: rpcData, error: rpcError } = await supabase.rpc('get_low_stock_products')

                if (rpcError) {
                    console.log('❌ RPC function failed:', rpcError.message)
                    results.rpcTest = { success: false, error: rpcError.message }
                } else {
                    console.log('✅ RPC function works! Found low stock products:', rpcData?.length || 0)
                    results.rpcTest = { success: true, count: rpcData?.length || 0, data: rpcData }
                }

                // Test 2: Check products table directly
                console.log('📊 Checking products table directly...')
                const { data: products, error: productsError } = await supabase
                    .from('products')
                    .select('id, name, stock_quantity, low_stock_threshold')

                if (productsError) {
                    console.log('❌ Products table query failed:', productsError.message)
                    results.productsTest = { success: false, error: productsError.message }
                } else {
                    console.log(`✅ Found ${products?.length || 0} products in database`)
                    results.productsTest = { success: true, count: products?.length || 0 }
                    results.allProducts = products || []

                    if (products && products.length > 0) {
                        // Filter for low stock manually
                        const lowStockProducts = products.filter(
                            (p: any) => p.stock_quantity <= p.low_stock_threshold && p.low_stock_threshold > 0
                        )

                        console.log(`🔍 Products with low stock (manual filter): ${lowStockProducts.length}`)
                        results.lowStockProducts = lowStockProducts
                    }
                }

            } catch (error: any) {
                console.log('💥 Unexpected error:', error.message)
                results.error = error.message
            }

            setDebugInfo(results)
            setIsLoading(false)
        }

        testLowStock()
    }, [])

    if (isLoading) {
        return <div className="p-6">🔄 Testing low stock functionality...</div>
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">🔍 Low Stock Debug Information</h1>

            <div className="space-y-6">
                {/* RPC Function Test */}
                <div className="bg-white border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-2">📞 RPC Function Test</h2>
                    {debugInfo.rpcTest?.success ? (
                        <div className="text-green-600">
                            ✅ RPC function works! Found {debugInfo.rpcTest.count} low stock products
                            {debugInfo.rpcTest.data?.length > 0 && (
                                <ul className="mt-2 ml-4">
                                    {debugInfo.rpcTest.data.map((product: any, index: number) => (
                                        <li key={index}>
                                            {product.name}: {product.stock_quantity}/{product.low_stock_threshold}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <div className="text-red-600">
                            ❌ RPC function failed: {debugInfo.rpcTest?.error || 'Unknown error'}
                            <div className="text-sm text-gray-600 mt-1">
                                💡 This means the get_low_stock_products function is not deployed to your database
                            </div>
                        </div>
                    )}
                </div>

                {/* Products Table Test */}
                <div className="bg-white border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-2">📊 Products Table Test</h2>
                    {debugInfo.productsTest?.success ? (
                        <div className="text-green-600">
                            ✅ Found {debugInfo.productsTest.count} products in database
                        </div>
                    ) : (
                        <div className="text-red-600">
                            ❌ Products table query failed: {debugInfo.productsTest?.error || 'Unknown error'}
                        </div>
                    )}
                </div>

                {/* Low Stock Products */}
                {debugInfo.lowStockProducts?.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-2">🔴 Low Stock Products ({debugInfo.lowStockProducts.length})</h2>
                        <ul className="space-y-1">
                            {debugInfo.lowStockProducts.map((product: any, index: number) => (
                                <li key={index} className="text-orange-800">
                                    • {product.name}: {product.stock_quantity}/{product.low_stock_threshold} (LOW)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* All Products */}
                {debugInfo.allProducts?.length > 0 && (
                    <div className="bg-white border rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-2">📋 All Products ({debugInfo.allProducts.length})</h2>
                        <ul className="space-y-1 text-sm">
                            {debugInfo.allProducts.map((product: any, index: number) => {
                                const isLowStock = product.stock_quantity <= product.low_stock_threshold && product.low_stock_threshold > 0
                                return (
                                    <li key={index} className={isLowStock ? 'text-red-600' : 'text-green-600'}>
                                        {isLowStock ? '🔴' : '✅'} {product.name}: {product.stock_quantity}/{product.low_stock_threshold}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}

                {/* Error */}
                {debugInfo.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-2">💥 Error</h2>
                        <div className="text-red-800">{debugInfo.error}</div>
                    </div>
                )}
            </div>
        </div>
    )
}