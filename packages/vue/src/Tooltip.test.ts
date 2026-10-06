import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import Tooltip from './Tooltip.vue';
import { TooltipPlugin } from './plugin.js';

const DEFAULT_DELAY = 100;

function findTip(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.tooltip');
}

// The anchor template ref is resolved in a post-flush watcher, so wait one tick after mounting.
async function mountTip(...args: Parameters<typeof mount<typeof Tooltip>>) {
  const wrapper = mount(...args);
  await nextTick();
  return wrapper;
}

async function hover(element: Element, delay = DEFAULT_DELAY): Promise<void> {
  element.dispatchEvent(new Event('pointerenter'));
  await vi.advanceTimersByTimeAsync(delay);
}

describe('Tooltip component', () => {
  it('renders a span anchor with the slot content by default', () => {
    const wrapper = mount(Tooltip, { props: { content: 'c' }, slots: { default: 'Slot' } });
    expect(wrapper.element.tagName).toBe('SPAN');
    expect(wrapper.classes()).toEqual(['tooltip-anchor']);
    expect(wrapper.text()).toBe('Slot');
    wrapper.unmount();
  });

  it('renders the tag given in "as"', () => {
    const wrapper = mount(Tooltip, { props: { content: 'c', as: 'div' } });
    expect(wrapper.element.tagName).toBe('DIV');
    wrapper.unmount();
  });

  it('shows the content on hover', async () => {
    const wrapper = await mountTip(Tooltip, {
      props: { content: 'Tip' },
      attachTo: document.body,
    });
    await hover(wrapper.element);
    expect(findTip()?.textContent).toBe('Tip');
    wrapper.unmount();
  });

  it('passes placement, theme and delays through to the tooltip', async () => {
    const wrapper = await mountTip(Tooltip, {
      props: { content: 'Tip', placement: 'left', theme: 'light', showDelay: 300, hideDelay: 0 },
      attachTo: document.body,
    });
    await hover(wrapper.element, 299);
    expect(findTip()).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(findTip()?.dataset.placement).toBe('left');
    expect(findTip()?.className).toBe('tooltip tooltip--light');

    wrapper.element.dispatchEvent(new Event('pointerleave'));
    await vi.advanceTimersByTimeAsync(0);
    expect(findTip()).toBeNull();
    wrapper.unmount();
  });

  it('does not show when disabled', async () => {
    const wrapper = await mountTip(Tooltip, {
      props: { content: 'Tip', disabled: true },
      attachTo: document.body,
    });
    await hover(wrapper.element);
    expect(findTip()).toBeNull();
    wrapper.unmount();
  });

  it('reacts to prop changes', async () => {
    const wrapper = await mountTip(Tooltip, {
      props: { content: 'One' },
      attachTo: document.body,
    });
    await hover(wrapper.element);
    await wrapper.setProps({ content: 'Two' });
    await nextTick();
    expect(findTip()?.textContent).toBe('Two');
    wrapper.unmount();
  });

  it('uses plugin defaults for unset props', async () => {
    const wrapper = await mountTip(Tooltip, {
      props: { content: 'Tip' },
      attachTo: document.body,
      global: { plugins: [[TooltipPlugin, { placement: 'top', theme: 'light' }]] },
    });
    await hover(wrapper.element);
    expect(findTip()?.dataset.placement).toBe('top');
    expect(findTip()?.className).toBe('tooltip tooltip--light');
    wrapper.unmount();
  });

  // Characterizes current behavior: Vue casts an absent boolean prop to `false`,
  // so the component always overrides an app-level `disabled: true` (see suspected bugs).
  it('shows even when the plugin default is disabled: true', async () => {
    const wrapper = await mountTip(Tooltip, {
      props: { content: 'Tip' },
      attachTo: document.body,
      global: { plugins: [[TooltipPlugin, { disabled: true }]] },
    });
    await hover(wrapper.element);
    expect(findTip()).not.toBeNull();
    wrapper.unmount();
  });

  it('exposes show, hide and isOpen', async () => {
    const wrapper = await mountTip(Tooltip, {
      props: { content: 'Tip' },
      attachTo: document.body,
    });
    const exposed = wrapper.vm as unknown as { show(): void; hide(): void; isOpen: boolean };

    exposed.show();
    expect(exposed.isOpen).toBe(true);
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).not.toBeNull();

    exposed.hide();
    expect(exposed.isOpen).toBe(false);
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).toBeNull();
    wrapper.unmount();
  });

  it('removes the tooltip on unmount', async () => {
    const wrapper = await mountTip(Tooltip, {
      props: { content: 'Tip' },
      attachTo: document.body,
    });
    await hover(wrapper.element);
    wrapper.unmount();
    expect(findTip()).toBeNull();
  });
});
