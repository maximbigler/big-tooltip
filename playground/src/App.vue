<script setup lang="ts">
import { Tooltip, useTooltip } from '@maximbigler/vue-big-tooltip';
import { ref, useTemplateRef } from 'vue';

const placement = ref<'top' | 'bottom' | 'left' | 'right'>('bottom');

const manualAnchor = useTemplateRef<HTMLElement>('manualAnchor');
const { show, hide, isOpen } = useTooltip(manualAnchor, { content: 'composable tooltip' });
</script>

<template>
  <main>
    <h1>vue-big-tooltip playground</h1>

    <section>
      <h2>directive</h2>
      <button v-tooltip="'plain string value'">string</button>
      <button v-tooltip:right="{ content: 'arg sets placement' }">arg</button>
      <button v-tooltip.html="{ content: '<b>html</b> modifier' }">modifiers</button>
      <button v-tooltip="{ content: 'reactive placement: ' + placement, placement }">
        reactive ({{ placement }})
      </button>
      <button @click="placement = placement === 'bottom' ? 'left' : 'bottom'">
        toggle placement
      </button>
    </section>

    <section>
      <h2>component</h2>
      <Tooltip content="component tooltip" placement="bottom">
        <button>hover me</button>
      </Tooltip>
    </section>

    <section>
      <h2>composable</h2>
      <button ref="manualAnchor">anchor</button>
      <button @click="show()">show</button>
      <button @click="hide()">hide</button>
      <span>isOpen: {{ isOpen }}</span>
    </section>

    <section>
      <h2>Show delay & hide delay</h2>
      <Tooltip content="Pls wait 1 sec to hide" :show-delay="500" :hide-delay="1000">
        <button>Pls wait 0.5 sec to show</button>
      </Tooltip>
    </section>

    <section>
      <h2>Themes</h2>
      <Tooltip content="default theme">
        <button>default</button>
      </Tooltip>
      <Tooltip content="light theme" theme="light">
        <button>light</button>
      </Tooltip>
      <Tooltip content="custom theme" theme="ugly" :hide-delay="1000000">
        <button>custom</button>
      </Tooltip>
    </section>

    <section>
      <h2>html</h2>
      <Tooltip content="<b>html</b> modifier" html>
        <button>html</button>
      </Tooltip>
      <Tooltip content="<button>html</button> modifier" html>
        <button>Button in tooltip</button>
      </Tooltip>
    </section>

    <section>
      <h2>Interactive</h2>
      <Tooltip content="This is an interactive tooltip" interactive>
        <button>Hover me</button>
      </Tooltip>
      <Tooltip content="<button>html</button> modifier" html interactive>
        <button>Button in tooltip</button>
      </Tooltip>
    </section>

    <section>
      <h2>Triggers</h2>
      <Tooltip content="This is a tooltip with a hover trigger" :triggers="['hover']">
        <button>Hover me</button>
      </Tooltip>
      <Tooltip content="This is a tooltip with a focus trigger" :triggers="['focus']">
        <button>Focus me</button>
      </Tooltip>
    </section>

    <section>
      <h2>Images</h2>
      <img
        v-tooltip="'plain string value'"
        src="https://vuejs.org/images/logo.png"
        alt="Vue logo"
        width="100"
      />
    </section>

    <section>
      <h2>Arrow</h2>
      <Tooltip content="With arrow">
        <button>Hover me</button>
      </Tooltip>
      <Tooltip content="Without arrow" :arrow="false">
        <button>Hover me</button>
      </Tooltip>
    </section>
  </main>
</template>

<style>
body {
  font-family: system-ui, sans-serif;
  margin: 2rem;
}
section {
  margin-block: 1.5rem;
}
button {
  margin-right: 0.5rem;
}

.tooltip--ugly {
  --tooltip-background: #ff00ff;
  --tooltip-color: #000000;
}
</style>
