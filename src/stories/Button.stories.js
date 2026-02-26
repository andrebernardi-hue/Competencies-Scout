/**
 * Button component. Reuse in app; styles from tokens.
 */
import '../components/button.css';

export default {
  title: 'Components/Button',
  parameters: { layout: 'padded' },
};

export const Default = () => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn type-button';
  btn.textContent = 'Default';
  return btn;
};

export const Primary = () => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--primary type-button';
  btn.textContent = 'Primary';
  return btn;
};

export const Sizes = () => {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  wrap.style.alignItems = 'center';
  ['btn--sm', '', 'btn--lg'].forEach((mod) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `btn type-button ${mod}`.trim();
    b.textContent = mod ? (mod === 'btn--sm' ? 'Small' : 'Large') : 'Medium';
    wrap.appendChild(b);
  });
  return wrap;
};
