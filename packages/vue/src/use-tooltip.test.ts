import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue';
import { TooltipPlugin } from './plugin';
import type { TooltipPluginOptions } from './plugin';
import { useTooltip } from './use-tooltip';
import type { TooltipConfig } from '@maximbigler/big-tooltip-core';

const DEFAULT_DELAY = 100;

function findTip(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.tooltip');
}

type Target = HTMLElement | ComponentPublicInstance | null | undefined;

function mountComposable(
  target: MaybeRefOrGetter<Target>,
  config?: MaybeRefOrGetter<Partial<TooltipConfig>>,
  pluginOptions?: TooltipPluginOptions,
) {
  let api!: ReturnType<typeof useTooltip>;
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useTooltip(target, config);
        return () => h('div');
      },
    }),
    {
      attachTo: document.body,
      global: { plugins: pluginOptions ? [[TooltipPlugin, pluginOptions]] : [] },
    },
  );
  return { wrapper, api };
}

function createAnchor(): HTMLElement {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  return anchor;
}

describe('useTooltip', () => {
  it('creates a tooltip for an element and shows it on hover', async () => {
    const anchor = createAnchor();
    const { wrapper } = mountComposable(anchor, { content: 'Hi' });
    anchor.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()?.textContent).toBe('Hi');
    expect(anchor.getAttribute('aria-describedby')).toBe(findTip()?.id);
    wrapper.unmount();
  });

  it('uses the core defaults without the plugin', async () => {
    const anchor = createAnchor();
    const { wrapper, api } = mountComposable(anchor, { content: 'Hi' });
    api.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()?.dataset.placement).toBe('bottom');
    wrapper.unmount();
  });

  it('uses the plugin defaults when installed', async () => {
    const anchor = createAnchor();
    const { wrapper, api } = mountComposable(anchor, { content: 'Hi' }, { placement: 'top' });
    api.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()?.dataset.placement).toBe('top');
    wrapper.unmount();
  });

  it('accepts a component instance and uses its root element', async () => {
    const child = mount(defineComponent({ render: () => h('span', 'child') }), {
      attachTo: document.body,
    });
    const { wrapper } = mountComposable(child.vm, { content: 'Hi' });
    child.element.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).not.toBeNull();
    wrapper.unmount();
    child.unmount();
  });

  it('does nothing while the target is null', async () => {
    const { wrapper, api } = mountComposable(null, { content: 'Hi' });
    api.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).toBeNull();
    wrapper.unmount();
  });

  it('re-creates the tooltip when the target changes', async () => {
    const first = createAnchor();
    const second = createAnchor();
    const target = shallowRef<HTMLElement | null>(first);
    const { wrapper } = mountComposable(target, { content: 'Hi' });

    first.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).not.toBeNull();

    target.value = second;
    await nextTick();
    expect(findTip()).toBeNull();
    expect(first.hasAttribute('aria-describedby')).toBe(false);

    second.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(second.getAttribute('aria-describedby')).toBe(findTip()?.id);
    wrapper.unmount();
  });

  it('updates the tooltip when the config changes deeply', async () => {
    const anchor = createAnchor();
    const config = ref<Partial<TooltipConfig>>({ content: 'One' });
    const { wrapper, api } = mountComposable(anchor, config);
    api.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);

    config.value.content = 'Two';
    await nextTick();
    expect(findTip()?.textContent).toBe('Two');
    wrapper.unmount();
  });

  it('destroys the tooltip when the scope is disposed', async () => {
    const anchor = createAnchor();
    const { wrapper, api } = mountComposable(anchor, { content: 'Hi' });
    api.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    wrapper.unmount();
    expect(findTip()).toBeNull();
    expect(anchor.hasAttribute('aria-describedby')).toBe(false);
  });

  it('show() and hide() control the tooltip and isOpen', async () => {
    const anchor = createAnchor();
    const { wrapper, api } = mountComposable(anchor, { content: 'Hi' });
    expect(api.isOpen.value).toBe(false);

    api.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).not.toBeNull();
    expect(api.isOpen.value).toBe(true);

    api.hide();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).toBeNull();
    expect(api.isOpen.value).toBe(false);
    wrapper.unmount();
  });

  // The following characterize current isOpen behavior (see suspected bugs):
  // isOpen tracks only show()/hide() calls, not the real tooltip state.
  it('sets isOpen immediately on show(), before the delay elapses', () => {
    const anchor = createAnchor();
    const { wrapper, api } = mountComposable(anchor, { content: 'Hi' });
    api.show();
    expect(api.isOpen.value).toBe(true);
    expect(findTip()).toBeNull();
    wrapper.unmount();
  });

  it('sets isOpen on show() even when nothing can be shown', async () => {
    const anchor = createAnchor();
    const { wrapper, api } = mountComposable(anchor, { content: '' });
    api.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(api.isOpen.value).toBe(true);
    expect(findTip()).toBeNull();
    wrapper.unmount();
  });

  it('does not update isOpen when opened via hover', async () => {
    const anchor = createAnchor();
    const { wrapper, api } = mountComposable(anchor, { content: 'Hi' });
    anchor.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).not.toBeNull();
    expect(api.isOpen.value).toBe(false);
    wrapper.unmount();
  });
});
