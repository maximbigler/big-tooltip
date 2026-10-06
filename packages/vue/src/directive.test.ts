import { defaultConfig } from '@maximbigler/big-tooltip-core';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';
import { createTooltipDirective } from './directive';
import { TooltipPlugin } from './plugin';
import type { TooltipPluginOptions } from './plugin';

const DEFAULT_DELAY = 100;

function findTip(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.tooltip');
}

async function hover(element: Element): Promise<void> {
  element.dispatchEvent(new Event('pointerenter'));
  await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
}

function mountWithPlugin(template: string, options?: TooltipPluginOptions, setup = () => ({})) {
  return mount(defineComponent({ template, setup }), {
    attachTo: document.body,
    global: { plugins: [[TooltipPlugin, options]] },
  });
}

describe('v-tooltip directive', () => {
  it('accepts a plain string as content', async () => {
    const wrapper = mountWithPlugin(`<button v-tooltip="'Hello'">x</button>`);
    await hover(wrapper.element);
    expect(findTip()?.textContent).toBe('Hello');
    expect(findTip()?.dataset.placement).toBe('bottom');
    wrapper.unmount();
  });

  it('accepts a config object', async () => {
    const wrapper = mountWithPlugin(
      `<button v-tooltip="{ content: 'Obj', theme: 'light', placement: 'left' }">x</button>`,
    );
    await hover(wrapper.element);
    expect(findTip()?.textContent).toBe('Obj');
    expect(findTip()?.className).toBe('tooltip tooltip--light');
    expect(findTip()?.dataset.placement).toBe('left');
    wrapper.unmount();
  });

  it('uses the directive argument as placement', async () => {
    const wrapper = mountWithPlugin(`<button v-tooltip:right="'Arg'">x</button>`);
    await hover(wrapper.element);
    expect(findTip()?.dataset.placement).toBe('right');
    wrapper.unmount();
  });

  it('lets an explicit placement in the value override the argument', async () => {
    const wrapper = mountWithPlugin(
      `<button v-tooltip:right="{ content: 'x', placement: 'top' }">x</button>`,
    );
    await hover(wrapper.element);
    expect(findTip()?.dataset.placement).toBe('top');
    wrapper.unmount();
  });

  it('enables HTML rendering with the .html modifier', async () => {
    const wrapper = mountWithPlugin(`<button v-tooltip.html="'<b>bold</b>'">x</button>`);
    await hover(wrapper.element);
    expect(findTip()?.querySelector('b')?.textContent).toBe('bold');
    wrapper.unmount();
  });

  it('lets an explicit html: false in the value override the modifier', async () => {
    const wrapper = mountWithPlugin(
      `<button v-tooltip.html="{ content: '<b>x</b>', html: false }">x</button>`,
    );
    await hover(wrapper.element);
    expect(findTip()?.querySelector('b')).toBeNull();
    wrapper.unmount();
  });

  it('does not show for null or undefined values', async () => {
    const wrapper = mountWithPlugin(
      `<div><button v-tooltip="null">a</button><button v-tooltip="undefined">b</button></div>`,
    );
    for (const button of wrapper.findAll('button')) {
      await hover(button.element);
    }
    expect(findTip()).toBeNull();
    wrapper.unmount();
  });

  it('updates an open tooltip when the bound value changes', async () => {
    const content = ref('First');
    const wrapper = mountWithPlugin(`<button v-tooltip="content">x</button>`, undefined, () => ({
      content,
    }));
    await hover(wrapper.element);
    content.value = 'Second';
    await nextTick();
    expect(findTip()?.textContent).toBe('Second');
    wrapper.unmount();
  });

  it('destroys the tooltip when the element unmounts', async () => {
    const wrapper = mountWithPlugin(`<button v-tooltip="'Bye'">x</button>`);
    await hover(wrapper.element);
    expect(findTip()).not.toBeNull();
    wrapper.unmount();
    expect(findTip()).toBeNull();
  });

  it('falls back to the plugin defaults', async () => {
    const wrapper = mountWithPlugin(`<button v-tooltip="'Hi'">x</button>`, {
      placement: 'top',
      theme: 'light',
    });
    await hover(wrapper.element);
    expect(findTip()?.dataset.placement).toBe('top');
    expect(findTip()?.className).toBe('tooltip tooltip--light');
    wrapper.unmount();
  });

  it('renders no SSR props', () => {
    const directive = createTooltipDirective(defaultConfig);
    expect(directive.getSSRProps?.({} as never, null as never)).toEqual({});
  });
});

describe('TooltipPlugin', () => {
  it('registers the directive as v-tooltip and the component as Tooltip by default', () => {
    const wrapper = mountWithPlugin(`<div><Tooltip content="c">x</Tooltip></div>`);
    expect(wrapper.find('.tooltip-anchor').exists()).toBe(true);
    wrapper.unmount();
  });

  it('supports a custom directive name', async () => {
    const wrapper = mountWithPlugin(`<button v-tip="'Custom'">x</button>`, {
      directiveName: 'tip',
    });
    await hover(wrapper.element);
    expect(findTip()?.textContent).toBe('Custom');
    wrapper.unmount();
  });

  it('supports a custom component name', () => {
    const wrapper = mountWithPlugin(`<div><MyTip content="c">x</MyTip></div>`, {
      componentName: 'MyTip',
    });
    expect(wrapper.find('.tooltip-anchor').exists()).toBe(true);
    wrapper.unmount();
  });

  it('skips component registration when componentName is false', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mountWithPlugin(`<div><Tooltip content="c">x</Tooltip></div>`, {
      componentName: false,
    });
    expect(wrapper.find('.tooltip-anchor').exists()).toBe(false);
    const warnings = warn.mock.calls.map(([message]) => String(message));
    expect(warnings.some((message) => message.includes('Failed to resolve component'))).toBe(true);
    warn.mockRestore();
    wrapper.unmount();
  });
});
