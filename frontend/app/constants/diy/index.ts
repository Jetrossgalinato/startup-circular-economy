import type {
  DiyCategory,
  DiyOrderStatus,
  DiyProductStatus,
} from '@/types/diy'

export const DIY_CATEGORIES: { value: DiyCategory, label: string }[] = [
  { value: 'home_decor', label: 'Home decor' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'storage', label: 'Storage' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'gadgets', label: 'Gadgets' },
  { value: 'other', label: 'Other' },
]

export const DIY_PRODUCT_STATUS_LABELS: Record<DiyProductStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  active: 'Live',
  hidden: 'Hidden',
  rejected: 'Rejected',
}

export const DIY_ORDER_STATUS_LABELS: Record<DiyOrderStatus, string> = {
  pending_payment: 'Waiting for payment',
  paid: 'Paid',
  ready: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

export const DIY_MAX_PHOTOS = 6

export function diyCategoryLabel(category: string | null | undefined) {
  return DIY_CATEGORIES.find((item) => item.value === category)?.label || category || 'Other'
}
