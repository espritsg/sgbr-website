import type { Event } from '@/payload-types'

export type ApplicationState =
  | { state: 'none' }
  | { state: 'notYetOpen'; opensAt: string }
  | { state: 'open'; deadline: string | null }
  | { state: 'closed' }

/**
 * Whether the application form of an event is visible right now (docs/formulare.md):
 * only between applicationOpensAt and applicationDeadline, and never after the event.
 */
export function applicationState(
  event: Pick<Event, 'applicationForm' | 'applicationOpensAt' | 'applicationDeadline' | 'startsAt'>,
  now: Date = new Date(),
): ApplicationState {
  if (!event.applicationForm) return { state: 'none' }
  const time = now.getTime()
  if (event.applicationOpensAt && time < new Date(event.applicationOpensAt).getTime()) {
    return { state: 'notYetOpen', opensAt: event.applicationOpensAt }
  }
  const deadline = event.applicationDeadline ?? event.startsAt
  if (deadline && time > new Date(deadline).getTime()) return { state: 'closed' }
  return { state: 'open', deadline: event.applicationDeadline ?? null }
}

/** Whether the event has started (same cut as the upcoming/past split in the queries). */
export function isPastEvent(event: Pick<Event, 'startsAt'>, now: Date = new Date()): boolean {
  return new Date(event.startsAt).getTime() <= now.getTime()
}
