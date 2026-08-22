import type { Listing } from '@/types/listings'

export function claimedListings(listings: Listing[]): Listing[] {
  return listings
    .filter((listing) => listing.status === 'claimed')
    .sort((a, b) => {
      const aTime = new Date(a.claimed_at ?? a.updated_at).getTime()
      const bTime = new Date(b.claimed_at ?? b.updated_at).getTime()
      return bTime - aTime
    })
}

export function unreadClaimCount(listings: Listing[]): number {
  return listings.filter((listing) =>
    listing.status === 'claimed' && !listing.claimed_seen_at,
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
