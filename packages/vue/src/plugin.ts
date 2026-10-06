import { resolveConfig } from '@maximbigler/big-tooltip-core';
import type { TooltipConfig } from '@maximbigler/big-tooltip-core';
import type { Plugin } from 'vue';
import Tooltip from './Tooltip.vue';
import { screenTipConfigKey } from './context';
import { createTooltipDirective } from './directive';

const DEFAULT_DIRECTIVE_NAME = 'tooltip';
const DEFAULT_COMPONENT_NAME = 'Tooltip';

export interface TooltipPluginOptions extends Partial<TooltipConfig> {
  directiveName?: string;
  /** Pass `false` to skip registering the global component. */
  componentName?: string | false;
}

export const TooltipPlugin: Plugin<[TooltipPluginOptions?]> = {
  install(app, options = {}) {
    const {
      directiveName = DEFAULT_DIRECTIVE_NAME,
      componentName = DEFAULT_COMPONENT_NAME,
      ...configOverrides
    } = options;
    const config = resolveConfig(configOverrides);

    app.provide(screenTipConfigKey, config);
    app.directive(directiveName, createTooltipDirective(config));

    if (componentName !== false) {
      app.component(componentName, Tooltip);
    }
  },
};
