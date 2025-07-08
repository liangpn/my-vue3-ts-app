import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { registerMcpConfig } from '@opentiny/vue-common'
import { createMcpTools, getTinyVueMcpConfig } from '@opentiny/tiny-vue-mcp'
import { Grid as TinyGrid } from '@opentiny/vue'
import '@opentiny/vue-theme/index.css'

// 注册 TinyVue 组件 MCP 配置
registerMcpConfig(getTinyVueMcpConfig(), createMcpTools)

const app = createApp(App)
app.component('tiny-grid', TinyGrid)
app.mount('#app')
