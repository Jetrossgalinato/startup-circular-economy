import { DIY_CACHE_KEYS, DIY_CACHE_TTL_MS } from '@/constants/diy/cache'
import type { DiyCartItem, DiyProduct } from '@/types/diy'

const CART_SELECT = `
  id,
  resident_id,
  product_id,
  quantity,
  created_at,
  updated_at,
  product:diy_products (
    id,
    collector_id,
    title,
    description,
    category,
    ewaste_source,
    price,
    stock,
    status,
    rejection_reason,
    collector_name,
    collector_phone,
    collector_address,
    collector_gcash_number,
    created_at,
    updated_at,
    diy_product_photos ( id, product_id, storage_path, sort_order, created_at )
  )
`

export function useDiyCart() {
  const supabase = useSupabase()
  const { user } = useAuth()
  const cache = useResidentCache()
  const { getSignedUrls } = useDiyUpload()

  function peekCart(): DiyCartItem[] | null {
    return cache.getCached<DiyCartItem[]>(DIY_CACHE_KEYS.cart)?.data ?? null
  }

  function invalidateCart() {
    cache.invalidate(DIY_CACHE_KEYS.cart)
  }

  async function hydrate(items: DiyCartItem[]): Promise<DiyCartItem[]> {
    return Promise.all(items.map(async (item) => {
      if (!item.product?.diy_product_photos?.length) {
        return item
      }
      const photos = await getSignedUrls(item.product.diy_product_photos)
      return {
        ...item,
        product: { ...item.product, diy_product_photos: photos },
      }
    }))
  }

  async function fetchCart(options: { force?: boolean } = {}): Promise<DiyCartItem[]> {
    return cache.swr(
      DIY_CACHE_KEYS.cart,
      DIY_CACHE_TTL_MS.cart,
      async () => {
        if (!user.value) {
          return []
        }

        const { data, error } = await supabase
          .from('diy_cart_items')
          .select(CART_SELECT)
          .eq('resident_id', user.value.id)
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        return hydrate((data ?? []) as unknown as DiyCartItem[])
      },
      options,
    )
  }

  async function addToCart(product: DiyProduct, quantity = 1): Promise<DiyCartItem[]> {
    if (!user.value) {
      throw new Error('Sign in to save items.')
    }
    if (product.status !== 'active' || product.stock < 1) {
      throw new Error('This piece is not available.')
    }

    const qty = Math.max(1, Math.min(quantity, product.stock))

    const { error } = await supabase
      .from('diy_cart_items')
      .upsert({
        resident_id: user.value.id,
        product_id: product.id,
        quantity: qty,
      }, { onConflict: 'resident_id,product_id' })

    if (error) {
      throw new Error(error.message)
    }

    invalidateCart()
    return fetchCart({ force: true })
  }

  async function updateQuantity(itemId: string, quantity: number): Promise<DiyCartItem[]> {
    if (quantity < 1) {
      return removeItem(itemId)
    }

    const { error } = await supabase
      .from('diy_cart_items')
      .update({ quantity })
      .eq('id', itemId)

    if (error) {
      throw new Error(error.message)
    }

    invalidateCart()
    return fetchCart({ force: true })
  }

  async function removeItem(itemId: string): Promise<DiyCartItem[]> {
    const { error } = await supabase
      .from('diy_cart_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      throw new Error(error.message)
    }

    invalidateCart()
    return fetchCart({ force: true })
  }

  return {
    peekCart,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
    invalidateCart,
  }
}
