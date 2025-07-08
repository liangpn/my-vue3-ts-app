import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { createServer } from 'http'

/**
 * 🚀 TinyVue MCP SSE 代理服务器
 * 
 * 这是一个 MCP SSE 代理服务器，作为桥梁：
 * - 上游：接收 Cursor 等 AI 客户端的 MCP 连接
 * - 下游：通过 SSE 与前端的 useNextClient 通信
 * 
 * 工作流程：
 * 1. Cursor → 本服务器 (MCP协议)
 * 2. 本服务器 → 前端 useNextClient (SSE)
 * 3. 前端 useNextClient → useNextServer (MessageChannel)
 * 4. useNextServer → TinyVue组件 (注册工具)
 */

// 创建 MCP 服务器实例
const server = new Server(
  { 
    name: 'tiny-vue-mcp-sse-proxy', 
    version: '1.0.0' 
  },
  { 
    capabilities: {
      tools: {},      // 工具能力将由前端动态提供
      resources: {}   // 资源能力将由前端动态提供
    }
  }
)

// 活跃连接计数
let activeConnections = 0

// 创建 HTTP 服务器处理 SSE 连接
const httpServer = createServer((req, res) => {
  // 设置 CORS 头部，允许跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,sse-session-id')
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    console.log('✅ 收到 OPTIONS 预检请求，已返回 200')
    return
  }
  
  // 处理 SSE 连接
  if (req.url?.startsWith('/sse')) {
    const sessionId = req.headers['sse-session-id']
    console.log(`📡 新的 SSE 连接请求 ${sessionId ? `(会话 ID: ${sessionId})` : '(无会话 ID)'}`)
    
    // 创建 SSE 传输层
    const transport = new SSEServerTransport('/sse', res)
    
    // 连接到 MCP 服务器
    server.connect(transport)
    activeConnections++
    
    console.log(`✅ SSE 客户端已连接 (当前连接数: ${activeConnections})`)
    console.log('🔗 等待前端注册 MCP 工具...')
    
    // 监听连接关闭
    res.on('close', () => {
      activeConnections--
      console.log(`❌ SSE 客户端断开连接 (剩余连接数: ${activeConnections})`)
    })
  } else {
    // 其他路径返回 404
    res.writeHead(404)
    res.end('Not Found')
    console.log(`⚠️ 收到未知路径请求: ${req.url}`)
  }
})

// 启动服务器
const PORT = 3001
httpServer.listen(PORT, () => {
  console.log('🚀 TinyVue MCP SSE 代理服务器启动成功！')
  console.log('📍 端口:', PORT)
  console.log('🔗 SSE 端点: http://localhost:' + PORT + '/sse')
  console.log('')
  console.log('📋 架构说明:')
  console.log('  Cursor/AI客户端')
  console.log('       ↓ (MCP协议)')
  console.log('  本SSE代理服务器 (3001端口)')
  console.log('       ↓ (SSE)')
  console.log('  前端 useNextClient')
  console.log('       ↓ (MessageChannel)')
  console.log('  前端 useNextServer')
  console.log('       ↓ (自动注册)')
  console.log('  TinyVue组件')
  console.log('')
  console.log('⏳ 等待连接...')
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务器...')
  httpServer.close(() => {
    console.log('✅ 服务器已关闭')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭服务器...')
  httpServer.close(() => {
    console.log('✅ 服务器已关闭')
    process.exit(0)
  })
})