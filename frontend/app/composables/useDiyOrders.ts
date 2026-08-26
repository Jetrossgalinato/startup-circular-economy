import { DIY_CACHE_KEYS, DIY_CACHE_TTL_MS } from '@/constants/diy/cache'
import type { DiyOrder, PlaceDiyOrderInput } from '@/types/diy'

function asOrder(row: Record<string, unknown>): DiyOrder {
  return {
    id: row.id as string,
    product_id: row.product_id as string,
    collector_id: row.collector_id as string,
    resident_id: row.resident_id as string,
    title: row.title as string,
    quantity: Number(row.quantity),
    unit_price: Number(row.unit_price),
    total_amount: Number(row.total_amount),
    payment_method: row.payment_method as DiyOrder['payment_method'],
    collector_gcash_number: (row.collector_gcash_number as string | null) ?? null,
    fulfillment_method: row.fulfillment_method as DiyOrder['fulfillment_method'],
    collector_name: (row.collector_name as string) ?? '',
    collector_phone: (row.collector_phone as string | null) ?? null,
    collector_address: (row.collector_address as string | null) ?? null,
    resident_name: (row.resident_name as string) ?? '',
    resident_phone: (row.resident_phone as string | null) ?? null,
    delivery_address: (row.delivery_address as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    status: row.status as DiyOrder['status'],
    rejection_reason: (row.rejection_reason as string | null) ?? null,
    paid_at: (row.paid_at as string | null) ?? null,
    completed_at: (row.completed_at as string | null) ?? null,
    cancelled_at: (row.cancelled_at as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export function useDiyOrders() {
  const supabase = useSupabase()
  const { user, profile } = useAuth()
  const cache = useResidentCache()

  function listKey() {
    const role = profile.value?.role
    if (role === 'collector') return DIY_CACHE_KEYS.collectorOrders
    if (role === 'admin') return DIY_CACHE_KEYS.adminOrders
    return DIY_CACHE_KEYS.residentOrders
  }

  function peekOrders(): DiyOrder[] | null {
    return cache.getCached<DiyOrder[]>(listKey())?.data ?? null
  }

  function peekOrder(id: string): DiyOrder | null {
    return cache.getCached<DiyOrder>(DIY_CACHE_KEYS.order(id))?.data ?? null
  }

  function remember(order: DiyOrder) {
    cache.setCached(DIY_CACHE_KEYS.order(order.id), order)
  }

  function invalidateOrders() {
    cache.invalidate(DIY_CACHE_KEYS.residentOrders)
    cache.invalidate(DIY_CACHE_KEYS.collectorOrders)
    cache.invalidate(DIY_CACHE_KEYS.adminOrders)
    cache.invalidate(DIY_CACHE_KEYS.orderPrefix)
    cache.invalidate(DIY_CACHE_KEYS.catalog)
    cache.invalidate(DIY_CACHE_KEYS.productPrefix)
    cache.invalidate(DIY_CACHE_KEYS.cart)
  }

  async function fetchOrders(options: { force?: boolean } = {}): Promise<DiyOrder[]> {
    return cache.swr(
      listKey(),
      DIY_CACHE_TTL_MS.orders,
      async () => {
        if (!user.value) {
          return []
        }

        let query = supabase
          .from('diy_orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (profile.value?.role === 'resident') {
          query = query.eq('resident_id', user.value.id)
        } else if (profile.value?.role === 'collector') {
          query = query.eq('collector_id', user.value.id)
        }

        const { data, error } = await query
        if (error) {
          throw new Error(error.message)
        }

        const orders = (data ?? []).map((row) => asOrder(row as Record<string, unknown>))
        for (const order of orders) {
          remember(order)
        }
        return orders
      },
      options,
    )
  }

  async function fetchOrder(id: string, options: { force?: boolean } = {}): Promise<DiyOrder | null> {
    return cache.swr(
      DIY_CACHE_KEYS.order(id),
      DIY_CACHE_TTL_MS.orders,
      async () => {
        const { data, error } = await supabase
          .from('diy_orders')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (error) {
          throw new Error(error.message)
        }

        return data ? asOrder(data as Record<string, unknown>) : null
      },
      options,
    )
  }

  async function callOrderRpc(fn: string, args: Record<string, unknown>): Promise<DiyOrder> {
    const { data, error } = await supabase.rpc(fn, args)
    if (error) {
      throw new Error(error.message)
    }
    const order = asOrder(data as Record<string, unknown>)
    remember(order)
    invalidateOrders()
    return order
  }

  async function placeOrder(input: PlaceDiyOrderInput): Promise<DiyOrder> {
    return callOrderRpc('place_diy_order', {
      p_product_id: input.productId,
      p_quantity: input.quantity,
      p_payment_method: input.paymentMethod,
      p_fulfillment_method: input.fulfillmentMethod,
      p_resident_phone: input.residentPhone,
      p_delivery_address: input.deliveryAddress,
      p_notes: input.notes ?? null,
    })
  }

  async function cancelOrder(id: string) {
    return callOrderRpc('cancel_diy_order', { p_order_id: id })
  }

  async function rejectOrder(id: string, reason?: string) {
    return callOrderRpc('reject_diy_order', { p_order_id: id, p_reason: reason ?? null })
  }

  async function markPaid(id: string) {
    return callOrderRpc('mark_diy_order_paid', { p_order_id: id })
  }

  async function fulfillOrder(id: string) {
    return callOrderRpc('fulfill_diy_order', { p_order_id: id })
  }

  async function completeOrder(id: string) {
    return callOrderRpc('complete_diy_order', { p_order_id: id })
  }

  return {
    peekOrders,
    peekOrder,
    fetchOrders,
    fetchOrder,
    placeOrder,
    cancelOrder,
    rejectOrder,
    markPaid,
    fulfillOrder,
    completeOrder,
    invalidateOrders,
  }
}
