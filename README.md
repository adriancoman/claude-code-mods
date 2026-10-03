# claude-mods

Small mods for [Claude Code](https://claude.com/claude-code), written as plugins of function hooks.

| Mod | What it does |
| --- | --- |
| [`prompt-highlight`](prompt-highlight) | Draws your prompts on a colored background so they stand out from the answers. |
| [`usage-status`](usage-status) | Shows the 5-hour and weekly usage limits, with reset times, in the status line. |
| [`collapse-answers`](collapse-answers) | Adds a **▾ Collapse** button under each answer that hides it, leaving only your question. |

> Built against Claude Code 2.1.287. The function-hooks API is early access and may change between releases.

## Install

Clone the repo:

```sh
git clone <this repo> ~/.claude/mods
```

Then list the mods you want in the `env` block of `~/.claude/settings.json`, separated by `:` (`;` on Windows):

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "~/.claude/mods/prompt-highlight:~/.claude/mods/usage-status:~/.claude/mods/collapse-answers"
  }
}
```

New sessions load them. To try one for a single session instead:

```sh
claude --plugin-dir ~/.claude/mods/collapse-answers
```

## Notes

- `usage-status` needs a Claude subscription; with an API key there are no limits to show. The figures update after each answer.
- `collapse-answers` only adds the button to answers given after it loaded.
- Change the highlight color with `BACKGROUND` in `prompt-highlight/hooks/index.tsx`.

## Developing

Check a mod with `claude plugin validate <mod folder>`. Claude Code writes the API types into `<mod folder>/.claude-plugin/types/` when it loads the mod, after which `tsc -p <mod folder>` type-checks it.

## License

MIT
