import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { resolveConfig } from './config';
import type { TooltipConfig, TooltipInstance, TooltipTrigger } from './types';

const CLASS_NAMES = {
  tip: 'tooltip',
  body: 'tooltip-body',
  arrow: 'tooltip-arrow',
} as const;

/** Minimum distance in px kept between the tooltip and the viewport edge. */
const VIEWPORT_PADDING = 8;

const TRIGGER_EVENTS: Record<TooltipTrigger, { show: string; hide: string }> = {
  hover: { show: 'pointerenter', hide: 'pointerleave' },
  focus: { show: 'focusin', hide: 'focusout' },
};

interface TipElements {
  root: HTMLElement;
  body: HTMLElement;
  arrow: HTMLElement;
}

let instanceCount = 0;

function tipClassName(theme: string): string {
  return `${CLASS_NAMES.tip} ${CLASS_NAMES.tip}--${theme}`;
}

function createDiv(className: string): HTMLDivElement {
  const div = document.createElement('div');
  div.className = className;
  return div;
}

function toPixels(value: number | undefined): string {
  return value == null ? '' : `${value}px`;
}

export function createTooltip(
  anchor: HTMLElement,
  initialConfig: Partial<TooltipConfig> = {},
): TooltipInstance {
  let config = resolveConfig(initialConfig);
  const id = `tooltip-${++instanceCount}`;

  let elements: TipElements | null = null;
  let stopAutoUpdate: (() => void) | null = null;
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let isOpen = false;
  let isDestroyed = false;

  function mountTip(): TipElements {
    const root = document.createElement('div');
    root.id = id;
    root.role = 'tooltip';
    root.className = tipClassName(config.theme);
    root.dataset.placement = config.placement;
    root.dataset.interactive = String(config.interactive);
    root.dataset.arrow = String(config.arrow);
    // Keeps the tip open while the pointer is over it; only reachable when interactive.
    root.addEventListener('pointerenter', show);
    root.addEventListener('pointerleave', hide);

    const arrowElement = createDiv(CLASS_NAMES.arrow);
    const body = createDiv(CLASS_NAMES.body);
    root.append(body, arrowElement);

    elements = { root, body, arrow: arrowElement };
    document.body.append(root);
    renderContent();
    return elements;
  }

  function unmountTip(): void {
    stopAutoUpdate?.();
    stopAutoUpdate = null;
    elements?.root.remove();
    elements = null;
    anchor.removeAttribute('aria-describedby');
  }

  function renderContent(): void {
    if (!elements) {
      return;
    }
    if (config.html) {
      elements.body.innerHTML = config.content;
    } else {
      elements.body.textContent = config.content;
    }
  }

  async function updatePosition(): Promise<void> {
    if (!elements) {
      return;
    }
    const { x, y, placement, middlewareData } = await computePosition(anchor, elements.root, {
      placement: config.placement,
      strategy: 'absolute',
      middleware: [
        offset(config.offset),
        flip(),
        shift({ padding: VIEWPORT_PADDING }),
        arrow({ element: elements.arrow }),
      ],
    });

    Object.assign(elements.root.style, { left: toPixels(x), top: toPixels(y) });
    elements.root.dataset.placement = placement;

    const arrowPosition = middlewareData.arrow;
    if (arrowPosition) {
      Object.assign(elements.arrow.style, {
        left: toPixels(arrowPosition.x),
        top: toPixels(arrowPosition.y),
      });
    }
  }

  function open(): void {
    const { root } = elements ?? mountTip();
    root.dataset.open = 'true';
    anchor.setAttribute('aria-describedby', id);
    stopAutoUpdate = autoUpdate(anchor, root, () => void updatePosition());
    isOpen = true;
  }

  function close(): void {
    unmountTip();
    isOpen = false;
  }

  function show(): void {
    clearTimeout(hideTimer);
    if (isDestroyed || isOpen || config.disabled || !config.content) {
      return;
    }
    showTimer = setTimeout(open, config.showDelay);
  }

  function hide(): void {
    clearTimeout(showTimer);
    if (isDestroyed || !isOpen) {
      return;
    }
    hideTimer = setTimeout(close, config.hideDelay);
  }

  function update(patch: Partial<TooltipConfig>): void {
    config = resolveConfig(config, patch);
    if (config.disabled) {
      hide();
      return;
    }
    if (!elements) {
      return;
    }
    elements.root.className = tipClassName(config.theme);
    elements.root.dataset.interactive = String(config.interactive);
    elements.root.dataset.arrow = String(config.arrow);
    renderContent();
    void updatePosition();
  }

  function destroy(): void {
    isDestroyed = true;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    unmountTip();
    detachListeners();
    isOpen = false;
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isOpen) {
      hide();
    }
  }

  function attachListeners(): void {
    for (const [trigger, events] of Object.entries(TRIGGER_EVENTS)) {
      if (config.triggers.includes(trigger as TooltipTrigger)) {
        anchor.addEventListener(events.show, show);
        anchor.addEventListener(events.hide, hide);
      }
    }
    document.addEventListener('keydown', onKeydown);
  }

  function detachListeners(): void {
    for (const events of Object.values(TRIGGER_EVENTS)) {
      anchor.removeEventListener(events.show, show);
      anchor.removeEventListener(events.hide, hide);
    }
    document.removeEventListener('keydown', onKeydown);
  }

  attachListeners();

  return {
    id,
    get isOpen() {
      return isOpen;
    },
    show,
    hide,
    update,
    destroy,
  };
}
