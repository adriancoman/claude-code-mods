export type CollapseAnswersTurns = {
  rowTurn: Record<string, string>
  first: Record<string, string>
  last: Record<string, string>
}

declare module 'claude-code' {
  interface PluginState {
    'collapse-answers': { turns: CollapseAnswersTurns; collapsed: string[] }
  }
}
