import { TooltipPlugin } from '@maximbigler/vue-tooltip';
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).use(TooltipPlugin, { placement: 'top', showDelay: 120 }).mount('#app');
