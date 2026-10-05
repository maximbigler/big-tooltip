import { createTooltip, resolveConfig } from '@maximbigler/big-tooltip-core';
import type {
  TooltipConfig,
  TooltipInstance,
  TooltipPlacement,
} from '@maximbigler/big-tooltip-core';
import type { DirectiveBinding, ObjectDirective } from 'vue';

export type TooltipValue = string | Partial<TooltipConfig> | null | undefined;

export type TooltipDirective = ObjectDirective<HTMLElement, TooltipValue>;

type TooltipBinding = DirectiveBinding<TooltipValue>;

/** Reads `v-tooltip:<placement>.html.interactive`. */
function configFromArgAndModifiers(binding: TooltipBinding): Partial<TooltipConfig> {
  return {
    ...(binding.arg ? { placement: binding.arg as TooltipPlacement } : {}),
    ...(binding.modifiers.html ? { html: true } : {}),
    ...(binding.modifiers.interactive ? { interactive: true } : {}),
  };
}

/** A string value is shorthand for `{ content: value }`. */
function configFromValue(value: TooltipValue): Partial<TooltipConfig> {
  return typeof value === 'string' ? { content: value } : (value ?? {});
}

function resolveBindingConfig(defaults: TooltipConfig, binding: TooltipBinding): TooltipConfig {
  // The bound value wins over the argument and modifiers.
  return resolveConfig(
    defaults,
    configFromArgAndModifiers(binding),
    configFromValue(binding.value),
  );
}

export function createTooltipDirective(defaults: TooltipConfig): TooltipDirective {
  const instances = new WeakMap<HTMLElement, TooltipInstance>();

  return {
    mounted(anchor, binding) {
      instances.set(anchor, createTooltip(anchor, resolveBindingConfig(defaults, binding)));
    },
    updated(anchor, binding) {
      instances.get(anchor)?.update(resolveBindingConfig(defaults, binding));
    },
    beforeUnmount(anchor) {
      instances.get(anchor)?.destroy();
      instances.delete(anchor);
    },
    getSSRProps() {
      return {};
    },
  };
}
