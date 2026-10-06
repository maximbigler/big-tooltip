import type { Placement } from '@floating-ui/dom';

export type TooltipPlacement = Placement;
export type TooltipTrigger = 'hover' | 'focus';

export interface TooltipConfig {
  content: string;
  placement: TooltipPlacement;
  offset: number;
  showDelay: number;
  hideDelay: number;
  theme: string;
  html: boolean;
  interactive: boolean;
  arrow: boolean;
  disabled: boolean;
  triggers: TooltipTrigger[];
}

export interface TooltipInstance {
  readonly id: string;
  readonly isOpen: boolean;
  show(): void;
  hide(): void;
  update(patch: Partial<TooltipConfig>): void;
  destroy(): void;
}
