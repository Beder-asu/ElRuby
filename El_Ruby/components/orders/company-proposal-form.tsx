"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Printer } from "lucide-react"
import Link from "next/link"
import { ProductSearch } from "@/components/orders/product-search"
import { useLanguage } from "@/lib/language-context"
import { Product } from "@/types/database"

interface ProposalItem {
    productId: string
    quantity: number
    unitPrice: number
}

interface CompanyProposalFormProps {
    products: Product[]
}

export function CompanyProposalForm({ products }: CompanyProposalFormProps) {
    const [companyName, setCompanyName] = useState("")
    const [notes, setNotes] = useState("")
    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([])
    const [showPreview, setShowPreview] = useState(false)

    const [showNewProductDialog, setShowNewProductDialog] = useState(false)
    const [newProductData, setNewProductData] = useState({
        name: "",
        description: "",
        price: "",
        cost: "",
        category: "",
        supplier: "",
    })
    const [productsList, setProductsList] = useState<Product[]>(products)
    const [activeProposalItemIndex, setActiveProposalItemIndex] = useState<number | null>(null)

    const { t, isRTL } = useLanguage()

    const addProposalItem = () => {
        setProposalItems([...proposalItems, { productId: "", quantity: 1, unitPrice: 0 }])
    }

    const removeProposalItem = (index: number) => {
        setProposalItems(proposalItems.filter((_, i) => i !== index))
    }

    const updateProposalItem = (index: number, field: keyof ProposalItem, value: string | number) => {
        const updatedItems = [...proposalItems]
        if (field === "productId" && typeof value === "string") {
            const product = productsList.find((p) => p.id === value)
            if (product) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    productId: value,
                    unitPrice: product.price,
                }
            }
        } else {
            updatedItems[index] = { ...updatedItems[index], [field]: value }
        }
        setProposalItems(updatedItems)
    }

    const calculateTotal = () => {
        return proposalItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
    }

    const handleCreateProduct = async () => {
        if (!newProductData.name.trim() || !newProductData.price) return

        // Create a temporary product for proposal use only (not saved to database)
        const newProduct: Product = {
            id: `temp-${Date.now()}`,
            name: newProductData.name.trim(),
            description: newProductData.description.trim() || undefined,
            price: Number.parseFloat(newProductData.price),
            cost: Number.parseFloat(newProductData.cost) || 0,
            stock_quantity: 0,
            low_stock_threshold: 10,
            category: newProductData.category.trim() || undefined,
            supplier: newProductData.supplier.trim() || undefined,
        }

        setProductsList([...productsList, newProduct])

        if (activeProposalItemIndex !== null) {
            updateProposalItem(activeProposalItemIndex, "productId", newProduct.id)
        }

        setNewProductData({
            name: "",
            description: "",
            price: "",
            cost: "",
            category: "",
            supplier: "",
        })
        setShowNewProductDialog(false)
        setActiveProposalItemIndex(null)
    }

    const generateProposal = () => {
        if (!companyName.trim()) {
            alert("Please enter a company name")
            return
        }
        if (proposalItems.length === 0) {
            alert("Please add at least one item to the proposal")
            return
        }
        setShowPreview(true)
    }

    const handlePrint = () => {
        window.print()
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-EG", {
            style: "currency",
            currency: "EGP",
        }).format(amount)
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString()
    }

    const proposalTotal = calculateTotal()

    if (showPreview) {
        return (
            <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
                <div className="max-w-4xl mx-auto p-6">
                    {/* Header Actions */}
                    <div className="flex items-center justify-between mb-6 print:hidden">
                        <div>
                            <h1 className="text-3xl font-bold">{t("companyProposal")}</h1>
                            <p className="text-muted-foreground">{companyName}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                {t("print")}
                            </Button>
                            <Button variant="outline" onClick={() => setShowPreview(false)}>
                                {t("back")}
                            </Button>
                        </div>
                    </div>

                    {/* Proposal Invoice */}
                    <Card className="proposal-printable">
                        <CardContent className="p-8">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-primary">{t("systemName")}</h2>
                                    <p className="text-muted-foreground">Point of Sale & Inventory</p>
                                </div>
                                <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                                    <div className="text-2xl font-bold">{t("proposal")}</div>
                                    <div className="text-muted-foreground">{t("date")}: {formatDate(new Date())}</div>
                                </div>
                            </div>

                            {/* Company Information */}
                            <div className="mb-8">
                                <h3 className="font-semibold mb-2">{t("company")}:</h3>
                                <p className="text-lg font-medium">{companyName}</p>
                            </div>

                            {/* Items */}
                            <div className="mb-8">
                                <h3 className="font-semibold mb-4">{t("items")}:</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{t("product")}</th>
                                                <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("quantity")}</th>
                                                <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("price")}</th>
                                                <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t("total")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {proposalItems.map((item, index) => {
                                                const product = productsList.find((p) => p.id === item.productId)
                                                return (
                                                    <tr key={index} className="border-t">
                                                        <td className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                                            <div className="font-medium">{product?.name || "Unknown Product"}</div>
                                                            {product?.description && (
                                                                <div className="text-sm text-muted-foreground">{product.description}</div>
                                                            )}
                                                        </td>
                                                        <td className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>
                                                            {item.quantity}
                                                        </td>
                                                        <td className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>
                                                            {formatCurrency(item.unitPrice)}
                                                        </td>
                                                        <td className={`p-3 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
                                                            {formatCurrency(item.quantity * item.unitPrice)}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-end">
                                <div className="w-64">
                                    <div className="flex justify-between text-xl font-bold border-t pt-4">
                                        <span>{t("total")}:</span>
                                        <span>{formatCurrency(proposalTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {notes && (
                                <div className="mt-8 pt-8 border-t">
                                    <h3 className="font-semibold mb-2">{t("notes")}:</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{notes}</p>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                                <p>{t("proposalValidityNote")}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`}>
            <div className="container mx-auto p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{t("companyProposal")}</h1>
                        <p className="text-muted-foreground">{t("createProposalForCompany")}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/orders/new">{t("backToNewOrder")}</Link>
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("companyInformation")}</CardTitle>
                                <CardDescription>{t("enterCompanyDetails")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="company-name">{t("companyName")} *</Label>
                                        <Input
                                            id="company-name"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder={t("enterCompanyName")}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{t("proposalItems")}</CardTitle>
                                        <CardDescription>{t("addProductsToProposal")}</CardDescription>
                                    </div>
                                    <Button type="button" onClick={addProposalItem} size="sm">
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t("addItem")}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {proposalItems.map((item, index) => {
                                        const product = productsList.find((p) => p.id === item.productId)
                                        return (
                                            <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <Label>{t("product")}</Label>
                                                    <ProductSearch
                                                        products={productsList}
                                                        value={item.productId}
                                                        onValueChange={(value) => updateProposalItem(index, "productId", value)}
                                                        onAddProduct={() => {
                                                            setActiveProposalItemIndex(index)
                                                            setShowNewProductDialog(true)
                                                        }}
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <Label>{t("quantity")}</Label>
                                                    <Input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            if (value === "" || Number.parseFloat(value) >= 0) {
                                                                updateProposalItem(index, "quantity", Number.parseFloat(value) || 0)
                                                            }
                                                        }}
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <Label>{t("price")}</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateProposalItem(index, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                                                    />
                                                </div>
                                                <div className="w-32">
                                                    <Label>{t("total")}</Label>
                                                    <div className="h-10 flex items-center font-medium">
                                                        {formatCurrency(item.quantity * item.unitPrice)}
                                                    </div>
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeProposalItem(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                    {proposalItems.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            {t("noItemsAddedYet")}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("proposalSummary")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>{t("items")} ({proposalItems.length})</span>
                                        <span>{formatCurrency(proposalTotal)}</span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-medium text-lg">
                                            <span>{t("total")}</span>
                                            <span>{formatCurrency(proposalTotal)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">{t("notes")}</Label>
                                    <Textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder={t("proposalNotesOptional")}
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <Button
                                onClick={generateProposal}
                                disabled={!companyName.trim() || proposalItems.length === 0}
                                className="w-full"
                            >
                                {t("generateProposal")}
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/dashboard/orders">{t("cancel")}</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Product Dialog */}
                <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{t("createNewProduct")}</DialogTitle>
                            <DialogDescription>{t("quicklyAddProduct")}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-product-name">{t("productName")} *</Label>
                                    <Input
                                        id="new-product-name"
                                        value={newProductData.name}
                                        onChange={(e) => setNewProductData((prev) => ({ ...prev, name: e.target.value }))}
                                        placeholder={t("productName")}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-product-price">{t("price")} *</Label>
                                    <Input
                                        id="new-product-price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newProductData.price}
                                        onChange={(e) => setNewProductData((prev) => ({ ...prev, price: e.target.value }))}
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-product-description">{t("description")}</Label>
                                <Textarea
                                    id="new-product-description"
                                    value={newProductData.description}
                                    onChange={(e) => setNewProductData((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder={t("description")}
                                    rows={2}
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="new-product-category">{t("category")}</Label>
                                    <Input
                                        id="new-product-category"
                                        value={newProductData.category}
                                        onChange={(e) => setNewProductData((prev) => ({ ...prev, category: e.target.value }))}
                                        placeholder={t("category")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-product-supplier">{t("supplier")}</Label>
                                    <Input
                                        id="new-product-supplier"
                                        value={newProductData.supplier}
                                        onChange={(e) => setNewProductData((prev) => ({ ...prev, supplier: e.target.value }))}
                                        placeholder={t("supplier")}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowNewProductDialog(false)
                                        setActiveProposalItemIndex(null)
                                    }}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleCreateProduct}
                                    disabled={!newProductData.name.trim() || !newProductData.price}
                                >
                                    {t("addProduct")}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}