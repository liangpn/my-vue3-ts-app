import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 引入 TinyVue 主题
import '@opentiny/vue-theme/index.css'

import { registerMcpConfig } from '@opentiny/vue-common'
import { createMcpTools, getTinyVueMcpConfig } from '@opentiny/tiny-vue-mcp'
// 注册 TinyVue 组件 MCP 配置
registerMcpConfig(getTinyVueMcpConfig(), createMcpTools)

const app = createApp(App)
app.mount('#app')

console.log('🎉 TinyVue MCP 应用已启动')



