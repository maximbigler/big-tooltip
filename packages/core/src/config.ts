import type { TooltipConfig } from './types';

export const defaultConfig: TooltipConfig = {
  content: '',
  placement: 'bottom',
  offset: 8,
  showDelay: 100,
  hideDelay: 100,
  theme: 'default',
  html: false,
  interactive: false,
  disabled: false,
  triggers: ['hover', 'focus'],
};

export function resolveConfig(...parts: Array<Partial<TooltipConfig> | undefined>): TooltipConfig {
  return Object.assign({}, defaultConfig, ...parts.filter(Boolean)) as TooltipConfig;
}
