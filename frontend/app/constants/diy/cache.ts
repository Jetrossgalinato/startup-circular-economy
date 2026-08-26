export const DIY_CACHE_KEYS = {
  catalog: 'diy-catalog',
  product: (id: string) => `diy-product:${id}`,
  productPrefix: 'diy-product:',
  myListings: 'diy-my-listings',
  reviewQueue: 'diy-review-queue',
  cart: 'diy-cart',
  residentOrders: 'diy-resident-orders',
  collectorOrders: 'diy-collector-orders',
  adminOrders: 'diy-admin-orders',
  order: (id: string) => `diy-order:${id}`,
  orderPrefix: 'diy-order:',
} as const

export const DIY_CACHE_TTL_MS = {
  catalog: 30 * 1000,
  product: 30 * 1000,
  listings: 30 * 1000,
  cart: 15 * 1000,
  orders: 20 * 1000,
} as const
