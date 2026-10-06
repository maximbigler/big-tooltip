<script setup lang="ts">
import type { TooltipPlacement, TooltipTrigger } from '@maximbigler/big-tooltip-core';
import { computed, useTemplateRef } from 'vue';
import { useTooltip } from './use-tooltip';

const props = withDefaults(
  defineProps<{
    content: string;
    placement?: TooltipPlacement;
    showDelay?: number;
    hideDelay?: number;
    theme?: string;
    disabled?: boolean;
    interactive?: boolean;
    html?: boolean;
    triggers?: TooltipTrigger[];
    as?: string;
  }>(),
  { as: 'span' },
);

const anchor = useTemplateRef<HTMLElement>('anchor');

// Only forward props that were set, so unset ones fall back to the app-level defaults.
const config = computed(() => ({
  content: props.content,
  ...(props.placement ? { placement: props.placement } : {}),
  ...(props.showDelay == null ? {} : { showDelay: props.showDelay }),
  ...(props.hideDelay == null ? {} : { hideDelay: props.hideDelay }),
  ...(props.theme ? { theme: props.theme } : {}),
  ...(props.disabled == null ? {} : { disabled: props.disabled }),
  ...(props.interactive == null ? {} : { interactive: props.interactive }),
  ...(props.html == null ? {} : { html: props.html }),
  ...(props.triggers ? { triggers: props.triggers } : {}),
}));

const { show, hide, isOpen } = useTooltip(anchor, config);

defineExpose({ show, hide, isOpen });
</script>

<template>
  <component :is="as" ref="anchor" class="tooltip-anchor">
    <slot />
  </component>
</template>
