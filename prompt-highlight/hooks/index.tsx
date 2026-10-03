import type { Register } from 'claude-code'

const BACKGROUND = '#2a3550'

export const register: Register = on => {
  on('ui.render', { component: 'UserMessage', props: { origin: { kind: 'composer' } } }, ($, e, next) => {
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box backgroundColor={BACKGROUND} paddingX={2} paddingY={1} width="100%">
        <Text color="white">{e.props.text}</Text>
      </Box>
    )
  })
}
