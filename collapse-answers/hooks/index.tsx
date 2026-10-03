import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { CollapseAnswersTurns } from '../types'

const EMPTY: CollapseAnswersTurns = { rowTurn: {}, first: {}, last: {} }

const turns = atom({ plugin: 'collapse-answers', key: 'turns' } as const, EMPTY)
const collapsed = atom({ plugin: 'collapse-answers', key: 'collapsed' } as const, [])

function toggle($: EngineInterface, turn: string) {
  return update($, collapsed, list => (list.includes(turn) ? list.filter(t => t !== turn) : [...list, turn]))
}

export const register: Register = on => {
  // The prompt row that opened the turn the next answer rows belong to.
  let current: string | null = null

  on('session.append', async ($, e, next) => {
    const stored = await next(e)

    if (e.agentId !== undefined || e.message.isMeta) {
      return stored
    }

    if (e.message.type === 'user' && e.origin.kind === 'composer') {
      current = e.uuid
    } else if (e.message.type === 'assistant' && current !== null) {
      const turn = current
      // A text block draws under the row's id, a tool call under its tool_use_id.
      const drawn = e.message.content.flatMap<string>(block =>
        block.type === 'text' ? [e.uuid] : block.type === 'tool_use' && typeof block.id === 'string' ? [block.id] : [],
      )
      const hasText = e.message.content.some(block => block.type === 'text')

      const head = drawn[0]

      if (head !== undefined) {
        await update($, turns, t => ({
          rowTurn: { ...t.rowTurn, ...Object.fromEntries(drawn.map(id => [id, turn])) },
          first: t.first[turn] ? t.first : { ...t.first, [turn]: head },
          last: hasText ? { ...t.last, [turn]: e.uuid } : t.last,
        }))
      }
    }

    return stored
  })

  on('ui.render', async ($, e, next) => {
    if (!['AssistantMessage', 'ToolUse', 'ToolResult', 'ToolGroup'].includes(e.component)) {
      return next(e)
    }

    const key = e.component === 'ToolGroup' ? (e.props.calls[0]?.tool_use_id ?? e.requestId) : e.requestId
    const t = await read($, turns)
    const turn = t.rowTurn[key]

    if (turn === undefined) {
      return next(e)
    }

    const { Box, Button } = $.ui.resolve(e)

    if ((await read($, collapsed)).includes(turn)) {
      return key === t.first[turn] && e.component !== 'ToolResult' ? (
        <Box>
          <Button key={`expand-${turn}`} label="▸ Show answer" onPress={() => toggle($, turn)} />
        </Box>
      ) : (
        <Box />
      )
    }

    if (e.component === 'AssistantMessage' && key === t.last[turn]) {
      return (
        <Box flexDirection="column">
          {await next(e)}
          <Box marginTop={1}>
            <Button key={`collapse-${turn}`} label="▾ Collapse" onPress={() => toggle($, turn)} />
          </Box>
        </Box>
      )
    }

    return next(e)
  })
}
