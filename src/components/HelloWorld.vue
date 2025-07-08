<script setup lang="ts">
import { useNextServer } from '@opentiny/next-vue'
import { ref, onMounted, nextTick } from 'vue'
import { TinyGrid } from '@opentiny/vue'

const result = useNextServer({
  serverInfo: { name: 'demo-app', version: '1.0.0' }
})
const server = result?.server

const loading = ref(true)
const gridRef = ref()

// 定义表格列
const columns = [
  { field: 'id', title: 'ID', width: 80 },
  { field: 'name', title: '名称', width: 150 },
  { field: 'value', title: '值', width: 150 },
  { field: 'status', title: '状态', width: 100 }
]

// 定义模拟数据（作为备用）
const defaultTableData = [
  { _RID: 1, id: 1, name: 'Item 1', value: 'Value 1', status: 'Active' },
  { _RID: 2, id: 2, name: 'Item 2', value: 'Value 2', status: 'Inactive' },
  { _RID: 3, id: 3, name: 'Item 3', value: 'Value 3', status: 'Active' },
  { _RID: 4, id: 4, name: 'Item 4', value: 'Value 4', status: 'Inactive' },
  { _RID: 5, id: 5, name: 'Item 5', value: 'Value 5', status: 'Active' }
]

const tableData = ref(defaultTableData)

// 模拟 MCP 工具调用
const callMcpTool = async (toolName: string, args: any = {}) => {
  try {
    console.log(`调用 MCP 工具: ${toolName}`, args)
    
    // 这里应该通过真正的 MCP 连接调用工具
    // 暂时直接返回本地模拟结果
    switch (toolName) {
      case 'demo-business_grid_component_tools_getTableData':
        return { success: true, data: tableData.value }
      case 'demo-business_grid_component_tools_insertRow':
        const newId = Math.max(...tableData.value.map(row => row.id)) + 1
        const newRID = Math.max(...tableData.value.map(row => row._RID)) + 1
        const newRow = {
          _RID: newRID,
          id: newId,
          name: args.name || `Item ${newId}`,
          value: args.value || `Value ${newId}`,
          status: args.status || 'Active'
        }
        tableData.value.push(newRow)
        return { success: true, message: 'Row added successfully' }
      default:
        return { success: false, message: 'Tool not found' }
    }
  } catch (error) {
    console.error('MCP 工具调用失败:', error)
    return { success: false, error }
  }
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    const result = await callMcpTool('demo-business_grid_component_tools_getTableData')
    if (result.success) {
      console.log('数据刷新成功')
    }
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 添加新行
const addNewRow = async () => {
  const newRowData = {
    name: `新项目 ${Date.now()}`,
    value: `新值 ${Date.now()}`,
    status: 'Active'
  }
  
  const result = await callMcpTool('demo-business_grid_component_tools_insertRow', newRowData)
  if (result.success) {
    console.log('新行添加成功')
  }
}

// 单元格点击事件
const onCellClick = (params: any) => {
  console.log('单元格点击:', params)
}

// 尝试从 MCP 服务器获取数据
const loadDataFromMCP = async () => {
  try {
    if (server) {
      console.log('MCP 服务器实例:', server)
      console.log('尝试从 MCP 服务器获取数据...')
      
      // 注册 MCP 工具到组件实例
      await nextTick()
      if (gridRef.value) {
        console.log('Grid 组件实例:', gridRef.value)
        // 这里可以进行真正的 MCP 工具注册
      }
    }
  } catch (error) {
    console.error('从 MCP 服务器获取数据失败:', error)
  } finally {
    // 无论成功与否，都使用本地数据并停止加载
    tableData.value = defaultTableData
    loading.value = false
  }
}

onMounted(() => {
  // 延迟一点显示加载效果，然后加载数据
  setTimeout(() => {
    loadDataFromMCP()
  }, 1000)
})
</script>

<template>
  <div>
    <div v-if="loading" class="loading">正在加载数据...</div>
    <div v-else>
      <div class="toolbar">
        <button @click="refreshData" class="btn">刷新数据</button>
        <button @click="addNewRow" class="btn">添加新行</button>
      </div>
      <tiny-grid
        ref="gridRef"
        :tiny_mcp_config="{
          server,
          business: {
            id: 'demo-business',
            description: '表格'
          }
        }"
        :data="tableData"
        :columns="columns"
        :height="400"
        @cell-click="onCellClick"
      >
        <!-- 表格内容 -->
      </tiny-grid>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HelloWorld'
}
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 14px;
}

.toolbar {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.btn {
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}
</style>
