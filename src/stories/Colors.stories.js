/**
 * Color tokens. Use CSS variables only; never hardcode hex in components.
 */
export default {
  title: 'Design system/Colors',
  parameters: { layout: 'padded' },
};

export const Grays = () => {
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.flexWrap = 'wrap';
  div.style.gap = '8px';
  ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].forEach(
    (n) => {
      const swatch = document.createElement('div');
      swatch.style.width = '80px';
      swatch.style.height = '48px';
      swatch.style.background = `var(--color-gray-${n})`;
      swatch.style.border = '1px solid var(--color-border)';
      swatch.style.borderRadius = '4px';
      swatch.title = `--color-gray-${n}`;
      div.appendChild(swatch);
    }
  );
  return div;
};

export const Accent = () => {
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.flexWrap = 'wrap';
  div.style.gap = '8px';
  ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].forEach(
    (n) => {
      const swatch = document.createElement('div');
      swatch.style.width = '80px';
      swatch.style.height = '48px';
      swatch.style.background = `var(--color-accent-${n})`;
      swatch.style.borderRadius = '4px';
      swatch.title = `--color-accent-${n}`;
      div.appendChild(swatch);
    }
  );
  return div;
};
