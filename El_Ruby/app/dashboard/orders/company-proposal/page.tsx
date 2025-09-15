import { createClient } from '@/lib/supabase/server'
import { Product } from '@/types/database'
import { CompanyProposalForm } from '@/components/orders/company-proposal-form'

export default async function CompanyProposalPage() {
    // Get all products for the proposal
    const supabase = await createClient()
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('name')

    return <CompanyProposalForm products={products || []} />
}