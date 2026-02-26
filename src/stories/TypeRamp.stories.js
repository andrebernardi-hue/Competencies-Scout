/**
 * Type ramp: 16 semantic styles. Use these classes in the app; never hardcode typography.
 */
export default {
  title: 'Design system/Type ramp',
  parameters: { layout: 'padded' },
};

const styles = [
  'type-display-1',
  'type-display-2',
  'type-heading-1',
  'type-heading-2',
  'type-heading-3',
  'type-heading-4',
  'type-body-lg',
  'type-body',
  'type-body-sm',
  'type-caption',
  'type-label',
  'type-overline',
  'type-code',
  'type-table-header',
  'type-table-cell',
  'type-button',
];

export const All = () => {
  const div = document.createElement('div');
  div.innerHTML = styles
    .map(
      (s) =>
        `<p class="${s}" style="margin: 0 0 0.5rem 0;">${s}: The quick brown fox</p>`
    )
    .join('');
  return div;
};
