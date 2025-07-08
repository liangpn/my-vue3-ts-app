<script setup lang="ts">
  import { useNextClient } from '@opentiny/next-vue'

  const { sessionId } = useNextClient({
    clientInfo: {
      name: 'your-app-name', // 应用名称
      version: '1.0.0', // 应用版本
      //sessionId: 'your-session-id' // 可选，不传由后台自动生成。调试时可使用 crypto.randomUUID() 生成固定值
    },
    proxyOptions: {
      url: 'http://localhost:3001/sse', // SSE 服务地址，目前 Agent 代理服务器暂未开放，如想进一步了解可以在 GitHub 中提 issue 单
      token: 'demo-token' // 认证 token
    }
  })
</script>

<template>
  <div>
    <h1>NextClient 代理客户端</h1>
    <p>会话 ID: {{ sessionId }}</p>
  </div>
</template>
