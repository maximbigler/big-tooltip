import * as core from '@maximbigler/big-tooltip-core';
import { describe, expect, it } from 'vitest';
import * as vuePackage from './index';

// Guards the public API surface of both packages during refactors.
describe('public exports', () => {
  it('core exports', () => {
    expect(Object.keys(core).sort()).toEqual(['createTooltip', 'defaultConfig', 'resolveConfig']);
  });

  it('vue exports', () => {
    expect(Object.keys(vuePackage).sort()).toEqual([
      'Tooltip',
      'TooltipPlugin',
      'createTooltipDirective',
      'defaultConfig',
      'screenTipConfigKey',
      'useTooltip',
    ]);
    expect(vuePackage.defaultConfig).toBe(core.defaultConfig);
  });

  it('injection key description', () => {
    expect(vuePackage.screenTipConfigKey.toString()).toBe('Symbol(tooltip:config)');
  });
});
