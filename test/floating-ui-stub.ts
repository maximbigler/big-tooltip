import type { ComputePositionConfig } from '@floating-ui/dom';
import { vi } from 'vitest';

export const offset = (options: unknown) => ({ name: 'offset', options });
export const flip = (options?: unknown) => ({ name: 'flip', options });
export const shift = (options: unknown) => ({ name: 'shift', options });
export const arrow = (options: unknown) => ({ name: 'arrow', options });

export const computePosition = vi.fn(
  async (
    _reference: Element,
    _floating: HTMLElement,
    options?: Partial<ComputePositionConfig>,
  ) => ({
    x: 10,
    y: 20,
    placement: options?.placement ?? 'bottom',
    strategy: 'absolute',
    middlewareData: { arrow: { x: 5 } } as { arrow?: { x?: number; y?: number } },
  }),
);

export const autoUpdate = vi.fn(
  (_reference: Element, _floating: HTMLElement, update: () => void): (() => void) => {
    update();
    return vi.fn();
  },
);
