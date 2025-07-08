<script setup lang="ts">
import { useNextServer } from '@opentiny/next-vue'
import { ref } from 'vue'
import { TinyGrid } from '@opentiny/vue'

// 创建本地 MCP 服务器实例
const serverResult = useNextServer({
  serverInfo: { 
    name: 'demo-app', 
    version: '1.0.0' 
  }
})

// 获取服务器实例
const server = serverResult?.server

// 定义表格列
const columns = [
  { field: 'id', title: 'ID', width: 80 },
  { field: 'name', title: '名称', width: 150 },
  { field: 'value', title: '值', width: 150 },
  { field: 'status', title: '状态', width: 100 }
]

// 表格数据
const tableData = ref([
  { id: 1, name: 'Item 1', value: 'Value 1', status: 'Active' },
  { id: 2, name: 'Item 2', value: 'Value 2', status: 'Inactive' },
  { id: 3, name: 'Item 3', value: 'Value 3', status: 'Active' },
  { id: 4, name: 'Item 4', value: 'Value 4', status: 'Inactive' },
  { id: 5, name: 'Item 5', value: 'Value 5', status: 'Active' }
])
</script>

<template>
  <div class="container">
    <h2>TinyVue MCP 表格测试</h2>
    
    <!-- Grid MCP 演示 -->
    <tiny-grid
      :data="tableData"
      :columns="columns"
      :tiny_mcp_config="{
        server,
        business: {
          id: 'demo-business',
          description: '表格业务演示'
        }
      }"
      :height="300"
      :show-checkbox="true"
      stripe
      border
    >
    </tiny-grid>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}
</style>
