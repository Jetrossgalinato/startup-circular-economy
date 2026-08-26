import { DIY_CACHE_KEYS, DIY_CACHE_TTL_MS } from '@/constants/diy/cache'
import type { DiyCategory, DiyProduct, DiyProductPhoto } from '@/types/diy'

const PRODUCT_SELECT = `
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
`

function asProduct(row: Record<string, unknown>): DiyProduct {
  const photos = ((row.diy_product_photos as DiyProductPhoto[]) ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)

  return {
    id: row.id as string,
    collector_id: row.collector_id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    category: row.category as DiyCategory,
    ewaste_source: (row.ewaste_source as string) ?? '',
    price: Number(row.price),
    stock: Number(row.stock ?? 0),
    status: row.status as DiyProduct['status'],
    rejection_reason: (row.rejection_reason as string | null) ?? null,
    collector_name: (row.collector_name as string) ?? '',
    collector_phone: (row.collector_phone as string | null) ?? null,
    collector_address: (row.collector_address as string | null) ?? null,
    collector_gcash_number: (row.collector_gcash_number as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    diy_product_photos: photos,
  }
}

export type DiyProductWrite = {
  title: string
  description: string
  category: DiyCategory
  ewaste_source: string
  price: number
  stock: number
}

export function useDiyProducts() {
  const supabase = useSupabase()
  const { user } = useAuth()
  const cache = useResidentCache()
  const { getSignedUrls } = useDiyUpload()

  async function withPhotos(products: DiyProduct[]): Promise<DiyProduct[]> {
    return Promise.all(products.map(async (product) => {
      const photos = await getSignedUrls(product.diy_product_photos ?? [])
      return { ...product, diy_product_photos: photos }
    }))
  }

  async function withPhoto(product: DiyProduct): Promise<DiyProduct> {
    const [next] = await withPhotos([product])
    if (!next) {
      throw new Error('Could not load product photos.')
    }
    return next
  }

  function peekCatalog(): DiyProduct[] | null {
    return cache.getCached<DiyProduct[]>(DIY_CACHE_KEYS.catalog)?.data ?? null
  }

  function peekMyListings(): DiyProduct[] | null {
    return cache.getCached<DiyProduct[]>(DIY_CACHE_KEYS.myListings)?.data ?? null
  }

  function peekReviewQueue(): DiyProduct[] | null {
    return cache.getCached<DiyProduct[]>(DIY_CACHE_KEYS.reviewQueue)?.data ?? null
  }

  function peekProduct(id: string): DiyProduct | null {
    return cache.getCached<DiyProduct>(DIY_CACHE_KEYS.product(id))?.data ?? null
  }

  function remember(product: DiyProduct) {
    cache.setCached(DIY_CACHE_KEYS.product(product.id), product)
  }

  function invalidateProducts() {
    cache.invalidate(DIY_CACHE_KEYS.catalog)
    cache.invalidate(DIY_CACHE_KEYS.myListings)
    cache.invalidate(DIY_CACHE_KEYS.reviewQueue)
    cache.invalidate(DIY_CACHE_KEYS.productPrefix)
  }

  async function fetchCatalog(options: { force?: boolean } = {}): Promise<DiyProduct[]> {
    return cache.swr(
      DIY_CACHE_KEYS.catalog,
      DIY_CACHE_TTL_MS.catalog,
      async () => {
        const { data, error } = await supabase
          .from('diy_products')
          .select(PRODUCT_SELECT)
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        const products = await withPhotos((data ?? []).map((row) => asProduct(row as Record<string, unknown>)))
        for (const product of products) {
          remember(product)
        }
        return products
      },
      options,
    )
  }

  async function fetchMyListings(options: { force?: boolean } = {}): Promise<DiyProduct[]> {
    return cache.swr(
      DIY_CACHE_KEYS.myListings,
      DIY_CACHE_TTL_MS.listings,
      async () => {
        if (!user.value) {
          return []
        }

        const { data, error } = await supabase
          .from('diy_products')
          .select(PRODUCT_SELECT)
          .eq('collector_id', user.value.id)
          .order('updated_at', { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        const products = await withPhotos((data ?? []).map((row) => asProduct(row as Record<string, unknown>)))
        for (const product of products) {
          remember(product)
        }
        return products
      },
      options,
    )
  }

  async function fetchReviewQueue(options: { force?: boolean } = {}): Promise<DiyProduct[]> {
    return cache.swr(
      DIY_CACHE_KEYS.reviewQueue,
      DIY_CACHE_TTL_MS.listings,
      async () => {
        const { data, error } = await supabase
          .from('diy_products')
          .select(PRODUCT_SELECT)
          .eq('status', 'pending_review')
          .order('updated_at', { ascending: true })

        if (error) {
          throw new Error(error.message)
        }

        const products = await withPhotos((data ?? []).map((row) => asProduct(row as Record<string, unknown>)))
        for (const product of products) {
          remember(product)
        }
        return products
      },
      options,
    )
  }

  async function fetchProduct(id: string, options: { force?: boolean } = {}): Promise<DiyProduct | null> {
    return cache.swr<DiyProduct | null>(
      DIY_CACHE_KEYS.product(id),
      DIY_CACHE_TTL_MS.product,
      async () => {
        const { data, error } = await supabase
          .from('diy_products')
          .select(PRODUCT_SELECT)
          .eq('id', id)
          .maybeSingle()

        if (error) {
          throw new Error(error.message)
        }

        if (!data) {
          return null
        }

        return withPhoto(asProduct(data as Record<string, unknown>))
      },
      options,
    )
  }

  async function createDraft(input: DiyProductWrite): Promise<DiyProduct> {
    if (!user.value) {
      throw new Error('You must be signed in to list a product.')
    }

    const { data, error } = await supabase
      .from('diy_products')
      .insert({
        collector_id: user.value.id,
        title: input.title,
        description: input.description,
        category: input.category,
        ewaste_source: input.ewaste_source,
        price: input.price,
        stock: input.stock,
        status: 'draft',
      })
      .select(PRODUCT_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const product = await withPhoto(asProduct(data as Record<string, unknown>))
    remember(product)
    cache.invalidate(DIY_CACHE_KEYS.myListings)
    return product
  }

  async function updateProduct(id: string, input: Partial<DiyProductWrite>): Promise<DiyProduct> {
    const { data, error } = await supabase
      .from('diy_products')
      .update(input)
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    const product = await withPhoto(asProduct(data as Record<string, unknown>))
    remember(product)
    invalidateProducts()
    return product
  }

  async function callProductRpc(fn: string, args: Record<string, unknown>): Promise<DiyProduct> {
    const { data, error } = await supabase.rpc(fn, args)
    if (error) {
      throw new Error(error.message)
    }
    const product = await withPhoto(asProduct(data as Record<string, unknown>))
    remember(product)
    invalidateProducts()
    return product
  }

  async function submitProduct(id: string) {
    return callProductRpc('submit_diy_product', { p_product_id: id })
  }

  async function approveProduct(id: string) {
    return callProductRpc('approve_diy_product', { p_product_id: id })
  }

  async function rejectProduct(id: string, reason: string) {
    return callProductRpc('reject_diy_product', { p_product_id: id, p_reason: reason })
  }

  async function hideProduct(id: string) {
    return callProductRpc('hide_diy_product', { p_product_id: id })
  }

  return {
    peekCatalog,
    peekMyListings,
    peekReviewQueue,
    peekProduct,
    fetchCatalog,
    fetchMyListings,
    fetchReviewQueue,
    fetchProduct,
    createDraft,
    updateProduct,
    submitProduct,
    approveProduct,
    rejectProduct,
    hideProduct,
    invalidateProducts,
  }
}
