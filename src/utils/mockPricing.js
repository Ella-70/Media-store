/**
 * Deterministic pricing helper for "The Stacks".
 * Calculates purchase and rental prices based on the item's normalized ID.
 * Single source of truth for prices across the application.
 */

function stringHash(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * Derives purchase and rental prices for any media item deterministically.
 * @param {object|string} item - Normalized item object (or item ID string)
 * @returns {{ buyPrice: number, rentPrice: number, rentalDurationHours: number }}
 */
export function getPricing(item) {
  if (!item) {
    return { buyPrice: 9.99, rentPrice: 3.99, rentalDurationHours: 48 }
  }

  const idStr = typeof item === 'string' ? item : String(item.id || item.product_id || '')
  const type = (typeof item === 'object' ? (item.type || item.product_type) : null) || (idStr.split('-')[0]) || 'movie'

  const hash = stringHash(idStr)

  let buyPrice
  if (type === 'movie') {
    // Movies range $9.99 – $19.99
    const buyStep = hash % 11
    buyPrice = 9.99 + buyStep
  } else {
    // Books, Manga, Comics range $4.99 – $14.99
    const buyStep = hash % 11
    buyPrice = 4.99 + buyStep
  }

  // Rental price = roughly 35-45% of purchase price, ending in .99
  const rawRent = buyPrice * 0.40
  let rentDollars = Math.floor(rawRent)
  if (rentDollars < 1) rentDollars = 1
  let rentPrice = rentDollars + 0.99

  if (rentPrice >= buyPrice) {
    rentPrice = Math.max(1.99, Number((buyPrice - 2.00).toFixed(2)))
  }

  return {
    buyPrice: Number(buyPrice.toFixed(2)),
    rentPrice: Number(rentPrice.toFixed(2)),
    rentalDurationHours: 48,
  }
}
