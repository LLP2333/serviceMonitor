<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold text-center text-blue-600 mb-8">Vue3 特性示例</h1>

    <!-- 响应式数据示例 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">1. 响应式数据 (ref & reactive)</h2>
      <div class="space-y-4">
        <div>
          <p class="text-gray-600">计数器 (ref): {{ count }}</p>
          <div class="space-x-2 mt-2">
            <button @click="increment" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              增加
            </button>
            <button @click="decrement" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              减少
            </button>
            <button @click="reset" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              重置
            </button>
          </div>
        </div>

        <div>
          <p class="text-gray-600">用户信息 (reactive):</p>
          <div class="mt-2 space-y-2">
            <input
              v-model="user.name"
              placeholder="姓名"
              class="border border-gray-300 px-3 py-2 rounded w-full max-w-xs"
            >
            <input
              v-model="user.email"
              placeholder="邮箱"
              class="border border-gray-300 px-3 py-2 rounded w-full max-w-xs"
            >
            <p class="text-sm text-gray-500">
              姓名: {{ user.name || '未填写' }}, 邮箱: {{ user.email || '未填写' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 计算属性示例 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">2. 计算属性 (computed)</h2>
      <div class="space-y-4">
        <div>
          <p class="text-gray-600">购物车:</p>
          <div class="space-y-2">
            <div v-for="item in cart" :key="item.id" class="flex items-center space-x-4">
              <span class="w-20">{{ item.name }}</span>
              <span class="w-16">¥{{ item.price }}</span>
              <input
                v-model.number="item.quantity"
                type="number"
                min="0"
                class="border border-gray-300 px-2 py-1 rounded w-16"
              >
              <span class="text-sm text-gray-500">小计: ¥{{ item.price * item.quantity }}</span>
            </div>
          </div>
          <div class="mt-4 p-3 bg-blue-50 rounded">
            <p class="font-semibold text-blue-800">
              总计: ¥{{ totalPrice }} ({{ totalItems }} 件商品)
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 条件渲染和列表渲染 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">3. 条件渲染 & 列表渲染</h2>
      <div class="space-y-4">
        <div>
          <button
            @click="showTodos = !showTodos"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {{ showTodos ? '隐藏' : '显示' }} 待办事项
          </button>
        </div>

        <div v-if="showTodos" class="space-y-3">
          <div class="flex space-x-2">
            <input
              v-model="newTodo"
              @keyup.enter="addTodo"
              placeholder="添加新的待办事项"
              class="border border-gray-300 px-3 py-2 rounded flex-1"
            >
            <button
              @click="addTodo"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              添加
            </button>
          </div>

          <div v-if="todos.length === 0" class="text-gray-500 text-center py-4">
            暂无待办事项
          </div>

          <ul v-else class="space-y-2">
            <li
              v-for="(todo, index) in todos"
              :key="todo.id"
              class="flex items-center space-x-3 p-3 border border-gray-200 rounded"
            >
              <input
                v-model="todo.completed"
                type="checkbox"
                class="w-4 h-4"
              >
              <span
                :class="{ 'line-through text-gray-500': todo.completed }"
                class="flex-1"
              >
                {{ todo.text }}
              </span>
              <button
                @click="removeTodo(index)"
                class="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
              >
                删除
              </button>
            </li>
          </ul>

          <div class="text-sm text-gray-600">
            完成: {{ completedTodos }}/{{ todos.length }}
          </div>
        </div>
      </div>
    </div>

    <!-- 生命周期和侦听器 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">4. 生命周期 & 侦听器</h2>
      <div class="space-y-4">
        <div>
          <p class="text-gray-600">组件已挂载时间: {{ mountedTime }}</p>
          <p class="text-gray-600">当前时间: {{ currentTime }}</p>
          <p class="text-gray-600">页面标题变化次数: {{ titleChangeCount }}</p>
        </div>

        <div>
          <input
            v-model="pageTitle"
            placeholder="修改页面标题"
            class="border border-gray-300 px-3 py-2 rounded w-full max-w-xs"
          >
          <p class="text-sm text-gray-500 mt-1">修改上面的输入框会自动更新页面标题</p>
        </div>
      </div>
    </div>

    <!-- 组件通信示例 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">5. 组件通信 (props & emit)</h2>
      <div class="space-y-4">
        <p class="text-gray-600">父组件消息: {{ parentMessage }}</p>
        <ChildComponent
          :message="parentMessage"
          :count="count"
          @update-message="updateParentMessage"
          @child-clicked="handleChildClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import ChildComponent from './ChildComponent.vue'

// 响应式数据
const count = ref(0)
const user = reactive({
  name: '',
  email: ''
})

// 计数器方法
const increment = () => count.value++
const decrement = () => count.value--
const reset = () => count.value = 0

// 购物车数据
const cart = reactive([
  { id: 1, name: '苹果', price: 5, quantity: 2 },
  { id: 2, name: '香蕉', price: 3, quantity: 1 },
  { id: 3, name: '橙子', price: 4, quantity: 3 }
])

// 计算属性
const totalPrice = computed(() => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const totalItems = computed(() => {
  return cart.reduce((total, item) => total + item.quantity, 0)
})

// 待办事项
const showTodos = ref(false)
const newTodo = ref('')
const todos = ref([
  { id: 1, text: '学习Vue3', completed: false },
  { id: 2, text: '完成项目', completed: true }
])

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value.trim(),
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (index) => {
  todos.value.splice(index, 1)
}

const completedTodos = computed(() => {
  return todos.value.filter(todo => todo.completed).length
})

// 生命周期和时间
const mountedTime = ref('')
const currentTime = ref('')
const pageTitle = ref('Vue3 示例页面')
const titleChangeCount = ref(0)

let timeInterval = null

onMounted(() => {
  mountedTime.value = new Date().toLocaleString()

  // 更新当前时间
  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleString()
  }, 1000)

  console.log('组件已挂载')
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  console.log('组件已卸载')
})

// 侦听器
watch(pageTitle, (newTitle) => {
  document.title = newTitle
  titleChangeCount.value++
}, { immediate: true })

// 组件通信
const parentMessage = ref('来自父组件的消息')

const updateParentMessage = (newMessage) => {
  parentMessage.value = newMessage
}

const handleChildClick = (data) => {
  alert(`子组件被点击了! 数据: ${data}`)
}
</script>

<style scoped>
/* 可以添加一些自定义样式 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
