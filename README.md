# big-tooltip

A small tooltip library for Vue 3. You can use it as a directive, a component or a composable. Positioning is handled by [Floating UI](https://floating-ui.com/).

## Getting Started

```bash
pnpm add @maximbigler/vue-big-tooltip
```

Register the plugin. Everything you pass here becomes the default for every tooltip in your app.

```ts
import { createApp } from 'vue';
import { TooltipPlugin } from '@maximbigler/vue-big-tooltip';
import App from './App.vue';

createApp(App).use(TooltipPlugin, { placement: 'top' }).mount('#app');
```

The styles get imported automatically, so you don't have to add a CSS file yourself.

### Directive

```vue
<button v-tooltip="'Hello there'">Hover me</button>

<!-- the argument sets the placement -->
<button v-tooltip:right="'On the right'">Hover me</button>

<!-- or pass an object -->
<button v-tooltip="{ content: '<b>Bold</b>', html: true }">Hover me</button>
```

You can also use the `.html` and `.interactive` modifiers instead of setting them in the object.

### Component

```vue
<Tooltip content="Hello there" placement="bottom">
  <button>Hover me</button>
</Tooltip>
```

The component wraps its content in a `span`. If you need a different element, use the `as` prop.

### Composable

If you want to control the tooltip yourself:

```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useTooltip } from '@maximbigler/vue-big-tooltip';

const anchor = useTemplateRef<HTMLElement>('anchor');
const { show, hide, isOpen } = useTooltip(anchor, { content: 'Hello there' });
</script>

<template>
  <button ref="anchor" @click="isOpen ? hide() : show()">Toggle</button>
</template>
```

## Properties

| Properties  | defaults             | descriptions                                              |
| ----------- | -------------------- | --------------------------------------------------------- |
| content     | `''`                 | The content which should be displayed                     |
| placement   | `'bottom'`           | The placement relative to the anchor                      |
| offset      | `8`                  | The distance in px between the tooltip and the anchor     |
| showDelay   | `100`                | How long it takes in ms to show the tooltip               |
| hideDelay   | `100`                | How long it takes in ms to remove the tooltip             |
| theme       | `'default'`          | The theme which should be selected                        |
| html        | `false`              | Enable html rendering at your own risk                    |
| interactive | `false`              | Make the tooltip interactive, so it remains open on hover |
| disabled    | `false`              | Disables the tooltip                                      |
| triggers    | `['hover', 'focus']` | When it should be opened                                  |

## Theming

There are two themes out of the box: `default` (dark) and `light`.

Every tooltip gets the class `tooltip--<theme>`, so making your own theme is just a matter of overriding some CSS variables:

```css
.tooltip--brand {
  --tooltip-background: #42b883;
  --tooltip-color: #ffffff;
}
```

```vue
<Tooltip content="Hello there" theme="brand">
  <button>Hover me</button>
</Tooltip>
```

These are the variables you can change:

| Variable               | default    |
| ---------------------- | ---------- |
| `--tooltip-background` | `#1f2937`  |
| `--tooltip-color`      | `#f9fafb`  |
| `--tooltip-radius`     | `6px`      |
| `--tooltip-padding`    | `6px 10px` |
| `--tooltip-font-size`  | `13px`     |
| `--tooltip-max-width`  | `260px`    |
| `--tooltip-z-index`    | `9999`     |
