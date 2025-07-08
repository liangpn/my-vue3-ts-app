<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNextClient } from '@opentiny/next-vue'
import HelloWorld from './components/HelloWorld.vue'

// 🚀 创建 NextClient 代理客户端
// 连接到外部的 SSE 代理服务器
const { sessionId } = useNextClient({
  clientInfo: {
    name: 'tiny-vue-mcp-demo',
    version: '1.0.0'
  },
  proxyOptions: {
    url: 'http://localhost:3001/sse',  // SSE 代理服务器地址
    token: 'demo-token'
  }
})

// 📡 连接状态管理
const connectionStatus = ref('初始化中...')

// 监听 MCP 连接状态
watch(sessionId, (newSessionId) => {
  if (newSessionId) {
    connectionStatus.value = '✅ 已连接'
    console.log('🔗 MCP 连接成功，会话 ID:', newSessionId)
  } else {
    connectionStatus.value = '⏳ 连接中...'
  }
}, { immediate: true })

// 连接超时检测
setTimeout(() => {
  if (!sessionId.value) {
    connectionStatus.value = '❌ 连接超时'
    console.warn('⚠️ MCP 连接超时，请检查 SSE 服务器是否已启动')
  }
}, 50000)
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🎯 TinyVue MCP 演示应用</h1>
      <div class="status-bar">
        <div class="status-item">
          <span class="label">📡 MCP 连接状态:</span>
          <span class="value" :class="{ 
            'connected': connectionStatus.includes('已连接'),
            'connecting': connectionStatus.includes('连接中'),
            'error': connectionStatus.includes('超时') || connectionStatus.includes('未连接')
          }">
            {{ connectionStatus }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">🔧 会话 ID:</span>
          <span class="value session-id">
            {{ sessionId || '无' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">📊 支持组件:</span>
          <span class="value">Grid, Button, BaseSelect</span>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <HelloWorld />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.status-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  max-width: 1000px;
  margin: 0 auto;
}

.status-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: #495057;
}

.value {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 500;
}

.value.connected {
  color: #28a745;
}

.value.connecting {
  color: #ffc107;
}

.value.error {
  color: #dc3545;
}

.session-id {
  font-size: 0.85rem;
  color: #6c757d;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-main {
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }
  
  .app-header h1 {
    font-size: 2rem;
  }
  
  .status-bar {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
