import { createTooltip, defaultConfig, resolveConfig } from '@maximbigler/big-tooltip-core';
import type { TooltipConfig, TooltipInstance } from '@maximbigler/big-tooltip-core';
import { inject, onScopeDispose, ref, toValue, watch } from 'vue';
import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue';
import { screenTipConfigKey } from './context';

type TooltipTarget = HTMLElement | ComponentPublicInstance | null | undefined;

function toElement(target: TooltipTarget): HTMLElement | null {
  if (!target) {
    return null;
  }
  return target instanceof HTMLElement ? target : ((target.$el as HTMLElement | undefined) ?? null);
}

export function useTooltip(
  target: MaybeRefOrGetter<TooltipTarget>,
  config: MaybeRefOrGetter<Partial<TooltipConfig>> = {},
) {
  const appDefaults = inject(screenTipConfigKey, defaultConfig);
  const resolveWithAppDefaults = (overrides: Partial<TooltipConfig>) =>
    resolveConfig(appDefaults, overrides);

  let instance: TooltipInstance | null = null;
  const isOpen = ref(false);

  function destroyInstance(): void {
    instance?.destroy();
    instance = null;
  }

  // `flush: 'post'` waits until template refs are populated after render.
  watch(
    () => toElement(toValue(target)),
    (element) => {
      destroyInstance();
      instance = element ? createTooltip(element, resolveWithAppDefaults(toValue(config))) : null;
    },
    { immediate: true, flush: 'post' },
  );

  watch(
    () => toValue(config),
    (next) => instance?.update(resolveWithAppDefaults(next)),
    { deep: true },
  );

  onScopeDispose(destroyInstance);

  function show(): void {
    instance?.show();
    isOpen.value = true;
  }

  function hide(): void {
    instance?.hide();
    isOpen.value = false;
  }

  return { isOpen, show, hide };
}
