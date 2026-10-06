import type TooltipComponent from './Tooltip.vue';
import type { TooltipDirective } from './directive';

declare module 'vue' {
  interface GlobalComponents {
    Tooltip: typeof TooltipComponent;
  }
  interface GlobalDirectives {
    vTooltip: TooltipDirective;
  }
}

export {};
