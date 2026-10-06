import '@maximbigler/big-tooltip-core/style.css';

export { default as Tooltip } from './Tooltip.vue';
export { screenTipConfigKey } from './context';
export { createTooltipDirective } from './directive';
export type { TooltipDirective, TooltipValue } from './directive';
export { TooltipPlugin, type TooltipPluginOptions } from './plugin';
export { useTooltip } from './use-tooltip';

// Re-exported so consumers can import everything from this package
// without also depending on the core package.
export { defaultConfig } from '@maximbigler/big-tooltip-core';
export type {
  TooltipConfig,
  TooltipInstance,
  TooltipPlacement,
} from '@maximbigler/big-tooltip-core';
