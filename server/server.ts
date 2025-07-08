import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { createServer } from 'http'

// 创建 MCP 服务器实例
const server = new Server(
  { name: 'tiny-vue-mcp-server', version: '1.0.0' },
  { 
    capabilities: {
      tools: {},
      resources: {}
    }
  }
)

// 模拟的表格数据存储
let tableData = [
  { _RID: 1, id: 1, name: 'Item 1', value: 'Value 1', status: 'Active' },
  { _RID: 2, id: 2, name: 'Item 2', value: 'Value 2', status: 'Inactive' },
  { _RID: 3, id: 3, name: 'Item 3', value: 'Value 3', status: 'Active' },
  { _RID: 4, id: 4, name: 'Item 4', value: 'Value 4', status: 'Inactive' },
  { _RID: 5, id: 5, name: 'Item 5', value: 'Value 5', status: 'Active' }
]

// 定义 TinyVue Grid 相关的工具
const gridTools = [
  {
    name: 'demo-business_grid_component_tools_getTableData',
    description: '表格-获取表格数据',
    inputSchema: {
      type: 'object',
      properties: {
        refresh: { type: 'boolean', description: '是否刷新数据' }
      }
    }
  },
  {
    name: 'demo-business_grid_component_tools_getColumns',
    description: '表格-获取列信息',
    inputSchema: {
      type: 'object',
      properties: {
        includeHidden: { type: 'boolean', description: '是否包含隐藏列' }
      }
    }
  },
  {
    name: 'demo-business_grid_component_tools_insertRow',
    description: '表格-插入新行',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '名称' },
        value: { type: 'string', description: '值' },
        status: { type: 'string', description: '状态' }
      },
      required: ['name', 'value', 'status']
    }
  },
  {
    name: 'demo-business_grid_component_tools_updateRow',
    description: '表格-更新行数据',
    inputSchema: {
      type: 'object',
      properties: {
        _RID: { type: 'number', description: '行ID' },
        name: { type: 'string', description: '名称' },
        value: { type: 'string', description: '值' },
        status: { type: 'string', description: '状态' }
      },
      required: ['_RID']
    }
  },
  {
    name: 'demo-business_grid_component_tools_removeRow',
    description: '表格-删除行',
    inputSchema: {
      type: 'object',
      properties: {
        _RID: { type: 'number', description: '行ID' }
      },
      required: ['_RID']
    }
  }
]

// 注册工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: gridTools
  }
})

// 注册工具调用处理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  
  try {
    switch (name) {
      case 'demo-business_grid_component_tools_getTableData':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tableData)
            }
          ]
        }
      
      case 'demo-business_grid_component_tools_getColumns':
        const columns = [
          { property: 'id', title: 'ID' },
          { property: 'name', title: '名称' },
          { property: 'value', title: '值' },
          { property: 'status', title: '状态' }
        ]
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(columns)
            }
          ]
        }
      
      case 'demo-business_grid_component_tools_insertRow':
        const newId = Math.max(...tableData.map(row => row.id)) + 1
        const newRID = Math.max(...tableData.map(row => row._RID)) + 1
        const newRow = {
          _RID: newRID,
          id: newId,
          name: String(args?.name || `Item ${newId}`),
          value: String(args?.value || `Value ${newId}`),
          status: String(args?.status || 'Active')
        }
        tableData.push(newRow)
        return {
          content: [
            {
              type: 'text',
              text: 'success'
            }
          ]
        }
      
      case 'demo-business_grid_component_tools_updateRow':
        const targetRowIndex = tableData.findIndex(row => row._RID === args?._RID)
        if (targetRowIndex !== -1) {
          if (args?.name) tableData[targetRowIndex].name = String(args.name)
          if (args?.value) tableData[targetRowIndex].value = String(args.value)
          if (args?.status) tableData[targetRowIndex].status = String(args.status)
          return {
            content: [
              {
                type: 'text',
                text: 'success'
              }
            ]
          }
        }
        return {
          content: [
            {
              type: 'text',
              text: 'failed: row not found'
            }
          ]
        }
      
      case 'demo-business_grid_component_tools_removeRow':
        const removeIndex = tableData.findIndex(row => row._RID === args?._RID)
        if (removeIndex !== -1) {
          tableData.splice(removeIndex, 1)
          return {
            content: [
              {
                type: 'text',
                text: 'success'
              }
            ]
          }
        }
        return {
          content: [
            {
              type: 'text',
              text: 'failed: row not found'
            }
          ]
        }
      
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    }
  }
})

// 添加资源列表处理
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'table://demo/data',
        name: '演示表格数据',
        description: '用于演示的表格数据资源'
      }
    ]
  }
})

// 添加资源读取处理
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params
  
  if (uri === 'table://demo/data') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(tableData, null, 2)
        }
      ]
    }
  }
  
  throw new Error(`Resource not found: ${uri}`)
})

const httpServer = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }
  
  // 只处理 /sse 路径
  if (req.url?.startsWith('/sse')) {
    const transport = new SSEServerTransport('/sse', res)
    server.connect(transport)
  } else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

httpServer.listen(3001, () => {
  console.log('TinyVue MCP Server running at http://localhost:3001')
  console.log('Available endpoints:')
  console.log('- SSE: /sse')
  console.log('Available tools:')
  gridTools.forEach(tool => {
    console.log(`  - ${tool.name}: ${tool.description}`)
  })
})