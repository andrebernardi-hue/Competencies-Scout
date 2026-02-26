/** @type { import('@storybook/html').Preview } */
import '../src/styles/tokens/index.css';
import '../src/styles/base/reset.css';
import '../src/styles/base/type-ramp.css';
import '../src/styles/base/tables.css';

const preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: 'fullscreen',
  },
};

export default preview;
