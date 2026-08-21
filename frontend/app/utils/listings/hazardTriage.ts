import type { HazardTier, HazardTriageResult, ListingCondition } from '@/types/listings'

/**
 * Deterministic Sec 4.1 classifier used when Cursor API is unavailable,
 * and as the schema the Cursor prompt must follow.
 */
export function classifyHazardFromCondition(
  condition: ListingCondition,
  categoryCode?: string | null,
): HazardTriageResult {
  const reasons: string[] = []
  const flags: string[] = []

  if (condition.radioactiveLabel || condition.fireOrHeatDamage) {
    reasons.push(
      condition.radioactiveLabel
        ? 'Radioactive labeling detected (e.g. old smoke detector)'
        : 'Visible fire or heat damage — unsafe to transport',
    )
    flags.push('refuse_intake')
    return { tier: 4, reasons, flags }
  }

  if (condition.leakage && condition.chemicalResidue) {
    reasons.push('Active leakage with chemical residue — refuse standard intake')
    flags.push('refuse_intake')
    return { tier: 4, reasons, flags }
  }

  const batteryHazard =
    condition.swelling
    || condition.batteryHeatOrDamage
    || (condition.batteryPresent && condition.leakage)
    || categoryCode === 'E'

  if (batteryHazard) {
    if (condition.swelling) {
      reasons.push('Battery swelling flagged — automatic hazardous track')
      flags.push('battery_swelling')
    }
    if (condition.batteryHeatOrDamage) {
      reasons.push('Battery heat or damage flagged')
      flags.push('battery_damage')
    }
    if (condition.leakage) {
      reasons.push('Leakage with battery present')
      flags.push('battery_leakage')
    }
    if (categoryCode === 'E' && reasons.length === 0) {
      reasons.push('Battery category — Tier 3 by default until visually cleared')
      flags.push('battery_category')
    }
    return { tier: 3, reasons, flags }
  }

  if (condition.chemicalResidue || condition.leakage) {
    reasons.push(
      condition.chemicalResidue
        ? 'Visible chemical residue'
        : 'Leakage reported',
    )
    flags.push('hazardous_material')
    return { tier: 3, reasons, flags }
  }

  if (
    condition.crtGlass
    || condition.crackedCasing
    || condition.exposedWiring
    || condition.unknownCondition
    || categoryCode === 'B1'
  ) {
    if (condition.crtGlass || categoryCode === 'B1') {
      reasons.push('CRT / leaded glass — caution by default')
      flags.push('crt_caution')
    }
    if (condition.crackedCasing) {
      reasons.push('Cracked casing')
      flags.push('cracked_casing')
    }
    if (condition.exposedWiring) {
      reasons.push('Exposed wiring')
      flags.push('exposed_wiring')
    }
    if (condition.unknownCondition) {
      reasons.push('Unknown internal condition')
      flags.push('unknown_condition')
    }
    return { tier: 2, reasons, flags }
  }

  reasons.push('No swelling, leakage, cracked casing, or exposed wiring flagged')
  if (condition.powersOn === true) {
    reasons.push('Device powers on or is cosmetically intact')
  }
  flags.push('standard')
  return { tier: 1, reasons, flags }
}

export function buildHazardTriagePrompt(input: {
  categoryCode?: string | null
  categoryName?: string | null
  condition: ListingCondition
  photoUrls?: string[]
}): string {
  return `You are the E-WISE hazard triage classifier for e-waste intake in Butuan City.
Classify the item into exactly one tier using these rules (bias toward OVER-flagging risk):

Tier 4 — Refuse intake: active leakage of unknown chemical, visible fire/heat damage, radioactive labeling, unsafe to transport.
Tier 3 — Hazardous: swelling or leaking battery, visible chemical residue, exposed heating element, suspected mercury, OR any battery swelling/leakage/heat. Battery category items default to Tier 3.
Tier 2 — Caution: cracked CRT glass (leaded), corrosion, aged capacitors, cracked casing, exposed wiring, unknown internal condition. CRT category defaults to Tier 2.
Tier 1 — Standard: no swelling, leakage, cracked casing, or exposed wiring; powers on or cosmetically intact.

Return ONLY valid JSON with this shape (no markdown):
{"tier":1|2|3|4,"reasons":["..."],"flags":["..."]}

Category code: ${input.categoryCode ?? 'unknown'}
Category name: ${input.categoryName ?? 'unknown'}
Condition form JSON:
${JSON.stringify(input.condition, null, 2)}
Photo URLs (may be empty):
${JSON.stringify(input.photoUrls ?? [], null, 2)}`
}

export function parseHazardTriageJson(text: string): HazardTriageResult {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('Hazard triage response did not include JSON.')
  }

  const parsed = JSON.parse(match[0]) as {
    tier?: number
    reasons?: unknown
    flags?: unknown
  }

  const tier = Number(parsed.tier) as HazardTier
  if (![1, 2, 3, 4].includes(tier)) {
    throw new Error('Hazard triage returned an invalid tier.')
  }

  const reasons = Array.isArray(parsed.reasons)
    ? parsed.reasons.filter((r): r is string => typeof r === 'string')
    : []
  const flags = Array.isArray(parsed.flags)
    ? parsed.flags.filter((f): f is string => typeof f === 'string')
    : []

  return { tier, reasons, flags }
}
