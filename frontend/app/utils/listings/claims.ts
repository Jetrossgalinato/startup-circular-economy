import type { Listing } from '@/types/listings'

export function isPendingClaim(listing: Listing): boolean {
  return listing.status === 'claimed' && !listing.claim_confirmed_at
}

export function isConfirmedClaim(listing: Listing): boolean {
  return listing.status === 'claimed' && Boolean(listing.claim_confirmed_at)
}

export function claimBadgeLabel(listing: Listing): string | undefined {
  if (isPendingClaim(listing)) {
    return 'Pending'
  }
  if (isConfirmedClaim(listing)) {
    return 'Confirmed'
  }
  return undefined
}

export function collectorClaimMessage(listing: Listing): string {
  if (!listing.claim_confirmed_at) {
    return 'Waiting for the cross-dock to confirm your claim.'
  }
  if (listing.fulfillment_method === 'delivery') {
    return 'This item will be delivered today.'
  }
  return 'Ready for pickup at the Butuan cross-dock today.'
}

export function claimedListings(listings: Listing[]): Listing[] {
  return listings
    .filter((listing) => listing.status === 'claimed')
    .sort((a, b) => {
      const aPending = !a.claim_confirmed_at
      const bPending = !b.claim_confirmed_at
      if (aPending !== bPending) {
        return aPending ? -1 : 1
      }
      const aTime = new Date(a.claimed_at ?? a.updated_at).getTime()
      const bTime = new Date(b.claimed_at ?? b.updated_at).getTime()
      return bTime - aTime
    })
}

export function unreadClaimCount(listings: Listing[]): number {
  return listings.filter((listing) =>
    listing.status === 'claimed'
    && !listing.claim_confirmed_at
    && !listing.claimed_seen_at,
  ).length
}

export function stampClaimsSeen(listings: Listing[], seenAt: string): Listing[] {
  return listings.map((listing) => {
    if (listing.status === 'claimed' && !listing.claimed_seen_at) {
      return { ...listing, claimed_seen_at: seenAt }
    }
    return listing
  })
}
