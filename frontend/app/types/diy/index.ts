export type DiyProductStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'hidden'
  | 'rejected'

export type DiyOrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export type DiyCategory =
  | 'home_decor'
  | 'lighting'
  | 'accessories'
  | 'storage'
  | 'furniture'
  | 'gadgets'
  | 'other'

export type DiyPaymentMethod = 'gcash' | 'cash'
export type DiyFulfillmentMethod = 'pickup' | 'delivery'

export type DiyProductPhoto = {
  id: string
  product_id: string
  storage_path: string
  sort_order: number
  created_at: string
  signed_url?: string
}

export type DiyProduct = {
  id: string
  collector_id: string
  title: string
  description: string
  category: DiyCategory
  ewaste_source: string
  price: number
  stock: number
  status: DiyProductStatus
  rejection_reason: string | null
  collector_name: string
  collector_phone: string | null
  collector_address: string | null
  collector_gcash_number: string | null
  created_at: string
  updated_at: string
  diy_product_photos?: DiyProductPhoto[]
}

export type DiyCartItem = {
  id: string
  resident_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: DiyProduct | null
}

export type DiyOrder = {
  id: string
  product_id: string
  collector_id: string
  resident_id: string
  title: string
  quantity: number
  unit_price: number
  total_amount: number
  payment_method: DiyPaymentMethod
  collector_gcash_number: string | null
  fulfillment_method: DiyFulfillmentMethod
  collector_name: string
  collector_phone: string | null
  collector_address: string | null
  resident_name: string
  resident_phone: string | null
  delivery_address: string | null
  notes: string | null
  status: DiyOrderStatus
  rejection_reason: string | null
  paid_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type PlaceDiyOrderInput = {
  productId: string
  quantity: number
  paymentMethod: DiyPaymentMethod
  fulfillmentMethod: DiyFulfillmentMethod
  residentPhone: string
  deliveryAddress: string
  notes?: string
}
