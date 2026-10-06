import { describe, expect, it } from 'vitest';
import { defaultConfig, resolveConfig } from './config';

describe('defaultConfig', () => {
  it('has the documented defaults', () => {
    expect(defaultConfig).toEqual({
      content: '',
      placement: 'bottom',
      offset: 8,
      showDelay: 100,
      hideDelay: 100,
      theme: 'default',
      html: false,
      interactive: false,
      arrow: true,
      disabled: false,
      triggers: ['hover', 'focus'],
    });
  });
});

describe('resolveConfig', () => {
  it('returns a copy of the defaults when called without parts', () => {
    const config = resolveConfig();
    expect(config).toEqual(defaultConfig);
    expect(config).not.toBe(defaultConfig);
  });

  it('applies later parts over earlier ones and skips undefined parts', () => {
    const config = resolveConfig({ content: 'a', offset: 1 }, undefined, { content: 'b' });
    expect(config).toEqual({ ...defaultConfig, content: 'b', offset: 1 });
  });

  it('keeps explicitly undefined keys from a part (shallow Object.assign semantics)', () => {
    const config = resolveConfig({ theme: undefined });
    expect('theme' in config).toBe(true);
    expect(config.theme).toBeUndefined();
  });

  it('does not mutate the defaults', () => {
    resolveConfig({ content: 'changed' });
    expect(defaultConfig.content).toBe('');
  });
});
