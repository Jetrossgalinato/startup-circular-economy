import { cwd } from 'node:process'
import { Agent } from '@cursor/sdk'
import {
  buildHazardTriagePrompt,
  classifyHazardFromCondition,
  parseHazardTriageJson,
} from '~/utils/listings/hazardTriage'
import type { ListingCondition } from '~/types/listings'

type TriageBody = {
  categoryCode?: string | null
  categoryName?: string | null
  condition: ListingCondition
  photoUrls?: string[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TriageBody>(event)

  if (!body?.condition || typeof body.condition !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Condition form is required.',
    })
  }

  const config = useRuntimeConfig()
  const apiKey = config.cursorApiKey as string

  // Prefer Cursor API when configured; fall back to Sec 4.1 rules for local/dev.
  if (!apiKey) {
    const result = classifyHazardFromCondition(body.condition, body.categoryCode)
    return {
      ...result,
      source: 'rules' as const,
    }
  }

  try {
    const prompt = buildHazardTriagePrompt({
      categoryCode: body.categoryCode,
      categoryName: body.categoryName,
      condition: body.condition,
      photoUrls: body.photoUrls,
    })

    const agentResult = await Promise.race([
      Agent.prompt(prompt, {
        apiKey,
        model: { id: 'composer-2.5' },
        local: { cwd: cwd() },
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Cursor triage timed out.')), 1500)
      }),
    ])

    const text = typeof agentResult.result === 'string'
      ? agentResult.result
      : JSON.stringify(agentResult.result ?? '')

    if (!text || agentResult.status === 'error') {
      throw new Error('Cursor hazard triage failed.')
    }

    const parsed = parseHazardTriageJson(text)
    return {
      ...parsed,
      source: 'cursor' as const,
    }
  } catch (error) {
    const result = classifyHazardFromCondition(body.condition, body.categoryCode)
    return {
      ...result,
      source: 'rules' as const,
      warning: error instanceof Error ? error.message : 'Cursor triage failed',
    }
  }
})
