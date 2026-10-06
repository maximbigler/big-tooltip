import { autoUpdate, computePosition } from '@floating-ui/dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTooltip } from './tip';
import type { TooltipConfig, TooltipInstance } from './types';

const DEFAULT_DELAY = 100;

let anchor: HTMLElement;
const created: TooltipInstance[] = [];

function createTip(config: Partial<TooltipConfig> = { content: 'Hello' }): TooltipInstance {
  const tip = createTooltip(anchor, config);
  created.push(tip);
  return tip;
}

function findTip(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.tooltip');
}

async function openTip(tip: TooltipInstance): Promise<void> {
  tip.show();
  await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
}

beforeEach(() => {
  anchor = document.createElement('button');
  document.body.append(anchor);
});

afterEach(() => {
  for (const tip of created.splice(0)) {
    tip.destroy();
  }
});

describe('createTooltip', () => {
  it('assigns unique ids of the form tooltip-<n>', () => {
    const first = createTip();
    const second = createTip();
    expect(first.id).toMatch(/^tooltip-\d+$/);
    expect(second.id).toMatch(/^tooltip-\d+$/);
    expect(first.id).not.toBe(second.id);
  });

  it('does not render anything until shown', () => {
    const tip = createTip();
    expect(findTip()).toBeNull();
    expect(tip.isOpen).toBe(false);
  });
});

describe('show', () => {
  it('mounts the tooltip after showDelay with the expected DOM structure', async () => {
    const tip = createTip();
    tip.show();

    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY - 1);
    expect(findTip()).toBeNull();

    await vi.advanceTimersByTimeAsync(1);
    const element = findTip();
    expect(element).not.toBeNull();
    expect(element?.parentElement).toBe(document.body);
    expect(element?.id).toBe(tip.id);
    expect(element?.getAttribute('role')).toBe('tooltip');
    expect(element?.className).toBe('tooltip tooltip--default');
    expect(element?.dataset.open).toBe('true');
    expect(element?.children).toHaveLength(2);
    expect(element?.children[0]?.className).toBe('tooltip-body');
    expect(element?.children[1]?.className).toBe('tooltip-arrow');
    expect(element?.querySelector('.tooltip-body')?.textContent).toBe('Hello');
    expect(anchor.getAttribute('aria-describedby')).toBe(tip.id);
    expect(tip.isOpen).toBe(true);
  });

  it('respects a custom showDelay', async () => {
    const tip = createTip({ content: 'Hi', showDelay: 500 });
    tip.show();
    await vi.advanceTimersByTimeAsync(499);
    expect(findTip()).toBeNull();
    await vi.advanceTimersByTimeAsync(1);
    expect(findTip()).not.toBeNull();
  });

  it('renders content as text by default', async () => {
    const tip = createTip({ content: '<b>bold</b>' });
    await openTip(tip);
    const body = findTip()?.querySelector('.tooltip-body');
    expect(body?.textContent).toBe('<b>bold</b>');
    expect(body?.querySelector('b')).toBeNull();
  });

  it('renders content as HTML when html is true', async () => {
    const tip = createTip({ content: '<b>bold</b>', html: true });
    await openTip(tip);
    expect(findTip()?.querySelector('.tooltip-body b')?.textContent).toBe('bold');
  });

  it('does nothing when content is empty', async () => {
    const tip = createTip({ content: '' });
    await openTip(tip);
    expect(findTip()).toBeNull();
    expect(tip.isOpen).toBe(false);
  });

  it('does nothing when disabled', async () => {
    const tip = createTip({ content: 'Hi', disabled: true });
    await openTip(tip);
    expect(findTip()).toBeNull();
  });

  it('does nothing when already open', async () => {
    const tip = createTip();
    await openTip(tip);
    await openTip(tip);
    expect(document.querySelectorAll('.tooltip')).toHaveLength(1);
    expect(autoUpdate).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending hide', async () => {
    const tip = createTip();
    await openTip(tip);
    tip.hide();
    tip.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY * 2);
    expect(findTip()).not.toBeNull();
    expect(tip.isOpen).toBe(true);
  });

  // Characterizes current behavior: a second show() before the first timer fires
  // schedules a second timer, so autoUpdate is started twice (see suspected bugs).
  it('starts autoUpdate once per scheduled show when called twice before the delay', async () => {
    const tip = createTip();
    tip.show();
    tip.show();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(document.querySelectorAll('.tooltip')).toHaveLength(1);
    expect(autoUpdate).toHaveBeenCalledTimes(2);
  });
});

describe('positioning', () => {
  it('computes the position with the configured options and applies the result', async () => {
    const tip = createTip({ content: 'Hi', placement: 'left-start', offset: 12 });
    await openTip(tip);

    expect(computePosition).toHaveBeenCalledWith(
      anchor,
      findTip(),
      expect.objectContaining({ placement: 'left-start', strategy: 'absolute' }),
    );
    const middleware = vi.mocked(computePosition).mock.calls[0]?.[2]?.middleware;
    expect(middleware).toEqual([
      { name: 'offset', options: 12 },
      { name: 'flip', options: undefined },
      { name: 'shift', options: { padding: 8 } },
      { name: 'arrow', options: { element: findTip()?.querySelector('.tooltip-arrow') } },
    ]);

    const element = findTip();
    expect(element?.style.left).toBe('10px');
    expect(element?.style.top).toBe('20px');
    expect(element?.dataset.placement).toBe('left-start');

    const arrow = element?.querySelector<HTMLElement>('.tooltip-arrow');
    expect(arrow?.style.left).toBe('5px');
    expect(arrow?.style.top).toBe('');
  });

  it('cleans up autoUpdate when hidden', async () => {
    const tip = createTip();
    await openTip(tip);
    const cleanup = vi.mocked(autoUpdate).mock.results[0]?.value as () => void;
    tip.hide();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

describe('hide', () => {
  it('removes the tooltip after hideDelay', async () => {
    const tip = createTip({ content: 'Hi', hideDelay: 300 });
    await openTip(tip);
    tip.hide();

    await vi.advanceTimersByTimeAsync(299);
    expect(findTip()).not.toBeNull();
    expect(tip.isOpen).toBe(true);

    await vi.advanceTimersByTimeAsync(1);
    expect(findTip()).toBeNull();
    expect(anchor.hasAttribute('aria-describedby')).toBe(false);
    expect(tip.isOpen).toBe(false);
  });

  it('cancels a pending show', async () => {
    const tip = createTip();
    tip.show();
    tip.hide();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY * 2);
    expect(findTip()).toBeNull();
  });

  it('can show again after hiding, re-creating the element', async () => {
    const tip = createTip();
    await openTip(tip);
    const firstElement = findTip();
    tip.hide();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    await openTip(tip);
    expect(findTip()).not.toBeNull();
    expect(findTip()).not.toBe(firstElement);
  });
});

describe('triggers', () => {
  it('shows on pointerenter and hides on pointerleave by default', async () => {
    const tip = createTip();
    anchor.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(true);

    anchor.dispatchEvent(new Event('pointerleave'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(false);
  });

  it('stays open while the pointer moves onto an interactive tip', async () => {
    const tip = createTip({ content: 'Hi', interactive: true });
    anchor.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()?.dataset.interactive).toBe('true');

    anchor.dispatchEvent(new Event('pointerleave'));
    findTip()?.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(true);

    findTip()?.dispatchEvent(new Event('pointerleave'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(false);
  });

  it('marks the tip when the arrow is disabled', async () => {
    const tip = createTip({ content: 'Hi', arrow: false });
    await openTip(tip);
    expect(findTip()?.dataset.arrow).toBe('false');

    tip.update({ arrow: true });
    expect(findTip()?.dataset.arrow).toBe('true');
  });

  it('shows on focusin and hides on focusout by default', async () => {
    const tip = createTip();
    anchor.dispatchEvent(new Event('focusin'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(true);

    anchor.dispatchEvent(new Event('focusout'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(false);
  });

  it('ignores hover events when only the focus trigger is enabled', async () => {
    const tip = createTip({ content: 'Hi', triggers: ['focus'] });
    anchor.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(false);

    anchor.dispatchEvent(new Event('focusin'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(true);
  });

  it('ignores focus events when only the hover trigger is enabled', async () => {
    const tip = createTip({ content: 'Hi', triggers: ['hover'] });
    anchor.dispatchEvent(new Event('focusin'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(false);
  });

  it('hides on Escape while open', async () => {
    const tip = createTip();
    await openTip(tip);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(false);
  });

  it('ignores other keys', async () => {
    const tip = createTip();
    await openTip(tip);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(true);
  });

  // Characterizes current behavior: listeners are attached once at creation.
  it('does not re-attach listeners when triggers change via update', async () => {
    const tip = createTip({ content: 'Hi', triggers: ['focus'] });
    tip.update({ triggers: ['hover'] });
    anchor.dispatchEvent(new Event('pointerenter'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(tip.isOpen).toBe(false);
  });
});

describe('update', () => {
  it('re-renders content, theme and position while open', async () => {
    const tip = createTip();
    await openTip(tip);
    vi.mocked(computePosition).mockClear();

    tip.update({ content: 'Changed', theme: 'light', placement: 'top' });
    await vi.advanceTimersByTimeAsync(0);

    const element = findTip();
    expect(element?.className).toBe('tooltip tooltip--light');
    expect(element?.querySelector('.tooltip-body')?.textContent).toBe('Changed');
    expect(computePosition).toHaveBeenCalledTimes(1);
    expect(element?.dataset.placement).toBe('top');
  });

  it('switches between text and HTML rendering', async () => {
    const tip = createTip({ content: '<i>x</i>' });
    await openTip(tip);
    tip.update({ html: true });
    expect(findTip()?.querySelector('.tooltip-body i')).not.toBeNull();
  });

  it('merges the patch into the current config', async () => {
    const tip = createTip({ content: 'Hi', theme: 'light' });
    tip.update({ content: 'Later' });
    await openTip(tip);
    expect(findTip()?.className).toBe('tooltip tooltip--light');
    expect(findTip()?.textContent).toBe('Later');
  });

  it('hides an open tooltip when disabled', async () => {
    const tip = createTip();
    await openTip(tip);
    tip.update({ disabled: true });
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).toBeNull();
    expect(tip.isOpen).toBe(false);
  });

  it('does not render while closed', () => {
    const tip = createTip();
    tip.update({ content: 'Changed' });
    expect(findTip()).toBeNull();
    expect(computePosition).not.toHaveBeenCalled();
  });
});

describe('destroy', () => {
  it('removes the tooltip immediately and cleans up the anchor', async () => {
    const tip = createTip();
    await openTip(tip);
    const cleanup = vi.mocked(autoUpdate).mock.results[0]?.value as () => void;

    tip.destroy();

    expect(findTip()).toBeNull();
    expect(anchor.hasAttribute('aria-describedby')).toBe(false);
    expect(tip.isOpen).toBe(false);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('cancels pending timers', async () => {
    const tip = createTip();
    tip.show();
    tip.destroy();
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).toBeNull();
  });

  it('ignores show, hide and events afterwards', async () => {
    const tip = createTip();
    tip.destroy();

    tip.show();
    anchor.dispatchEvent(new Event('pointerenter'));
    anchor.dispatchEvent(new Event('focusin'));
    await vi.advanceTimersByTimeAsync(DEFAULT_DELAY);
    expect(findTip()).toBeNull();
    expect(() => tip.hide()).not.toThrow();
  });
});
