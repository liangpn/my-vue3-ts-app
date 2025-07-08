<!-- <script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style> -->

<script setup lang="ts">
import { useNextClient } from '@opentiny/next-vue'
import { ref, watch } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

const isConnected = ref(false) // 恢复为 false，进行真正的连接检测
const error = ref<string | null>(null)

const { sessionId } = useNextClient({
  clientInfo: {
    name: 'demo-app',
    version: '1.0.0'
  },
  proxyOptions: {
    url: '/sse',
    token: 'test-token'
  }
})

// 监听 sessionId 的变化
watch(sessionId, (newSessionId) => {
  if (newSessionId) {
    isConnected.value = true
    error.value = null
    console.log('MCP 连接成功，会话 ID:', newSessionId)
  } else {
    isConnected.value = false
    error.value = '正在尝试连接 MCP 服务器...'
  }
}, { immediate: true })

// 连接超时检测
setTimeout(() => {
  if (!sessionId.value) {
    error.value = '无法连接到 MCP 服务器，请检查服务器是否启动'
    // 但仍然显示表格（使用本地数据）
    isConnected.value = true
  }
}, 5000)
</script>

<template>
  <div>
    <h1>NextClient 代理客户端</h1>
    <div class="status-bar">
      <p>会话 ID: {{ sessionId || '未连接' }}</p>
      <p class="connection-status" :class="{ connected: isConnected && sessionId, error: !!error }">
        状态: {{ isConnected && sessionId ? '已连接' : '未连接' }}
      </p>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="!sessionId && isConnected" class="warning">使用本地模拟数据</p>
    </div>
    <!-- 始终显示表格，无论连接状态如何 -->
    <HelloWorld />
  </div>
</template>

<style scoped>
.status-bar {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.connection-status {
  font-weight: bold;
}

.connection-status.connected {
  color: #28a745;
}

.connection-status.error {
  color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-weight: bold;
}

.warning {
  color: #ffc107;
  font-weight: bold;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
