import type { TooltipConfig } from '@maximbigler/big-tooltip-core';
import type { InjectionKey } from 'vue';

export const screenTipConfigKey: InjectionKey<TooltipConfig> = Symbol('tooltip:config');
