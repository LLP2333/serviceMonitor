<script setup>
import { ref, nextTick, computed, onMounted, onUnmounted } from 'vue'
import ChatSetting from './chatSetting.vue'
import { getAIResponse } from '../api/chat.js'

// 响应式数据
const conversations = ref([
  {
    id: 1,
    title: '新的对话',
    messages: [
      {
        id: 1,
        type: 'assistant',
        content: '你好！我是AI助手，有什么可以帮助你的吗？',
        timestamp: new Date()
      }
    ],
    lastUpdated: new Date()
  }
])

const currentConversationId = ref(1)
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)
const isSidebarCollapsed = ref(false)
const showSettings = ref(false)
const aiSettings = ref({
  apiUrl: '/api/chat/api/v3/chat/completions',
  modelName: 'deepseek-chat',
  apiKey: '',
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 2000
})

// 当前对话
const currentConversation = computed(() => {
  return conversations.value.find(conv => conv.id === currentConversationId.value)
})

const currentMessages = computed(() => {
  return currentConversation.value?.messages || []
})

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }

  // 更新对话标题（如果是第一条用户消息）
  if (currentMessages.value.length === 1) {
    const conv = conversations.value.find(c => c.id === currentConversationId.value)
    if (conv) {
      conv.title = inputMessage.value.slice(0, 30) + (inputMessage.value.length > 30 ? '...' : '')
    }
  }

  currentConversation.value.messages.push(userMessage)
  currentConversation.value.lastUpdated = new Date()

  // 立即保存用户消息
  saveConversations()

  inputMessage.value = ''
  isLoading.value = true

  await scrollToBottom()

  try {
    // 调用真正的AI API
    const aiResponseContent = await getAIResponse(currentMessages.value, aiSettings.value)

    const aiResponse = {
      id: Date.now() + 1,
      type: 'assistant',
      content: aiResponseContent,
      timestamp: new Date()
    }

    currentConversation.value.messages.push(aiResponse)
    currentConversation.value.lastUpdated = new Date()
  } catch (error) {
    console.error('获取AI回复失败:', error)

    // 显示错误消息
    const errorResponse = {
      id: Date.now() + 1,
      type: 'assistant',
      content: `抱歉，获取回复时出现错误：${error.message}\n\n请检查：\n1. 网络连接是否正常\n2. API密钥是否正确配置\n3. API服务是否可用\n\n你可以点击设置按钮重新配置API信息。`,
      timestamp: new Date()
    }

    currentConversation.value.messages.push(errorResponse)
    currentConversation.value.lastUpdated = new Date()
  } finally {
    isLoading.value = false
    await scrollToBottom()
    // 保存对话数据
    saveConversations()
  }
}



// 按回车发送
const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }

  // Ctrl+Enter 换行
  if (event.key === 'Enter' && event.ctrlKey) {
    inputMessage.value += '\n'
  }
}

// 新建对话
const newConversation = () => {
  const newConv = {
    id: Date.now(),
    title: '新的对话',
    messages: [
      {
        id: Date.now() + 1,
        type: 'assistant',
        content: '你好！我是AI助手，有什么可以帮助你的吗？',
        timestamp: new Date()
      }
    ],
    lastUpdated: new Date()
  }
  conversations.value.unshift(newConv)
  currentConversationId.value = newConv.id
  // 保存对话数据
  saveConversations()
}

// 切换对话
const switchConversation = (conversationId) => {
  currentConversationId.value = conversationId
  nextTick(() => scrollToBottom())
  // 保存当前对话ID
  saveConversations()
}

// 删除对话
const deleteConversation = (conversationId) => {
  if (conversations.value.length <= 1) return

  conversations.value = conversations.value.filter(conv => conv.id !== conversationId)

  if (currentConversationId.value === conversationId) {
    currentConversationId.value = conversations.value[0].id
  }
  // 保存对话数据
  saveConversations()
}

// 清空当前对话
const clearCurrentChat = () => {
  const conv = conversations.value.find(c => c.id === currentConversationId.value)
  if (conv) {
    conv.messages = [
      {
        id: Date.now(),
        type: 'assistant',
        content: '对话已清空，有什么可以帮助你的吗？',
        timestamp: new Date()
      }
    ]
    conv.title = '新的对话'
    conv.lastUpdated = new Date()
    // 保存对话数据
    saveConversations()
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 格式化时间
const formatTime = (date) => {
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
}

// 打开设置
const openSettings = () => {
  showSettings.value = true
}

// 关闭设置
const closeSettings = () => {
  showSettings.value = false
}

// 处理设置更新
const handleSettingsUpdate = (settings) => {
  aiSettings.value = { ...aiSettings.value, ...settings }
  console.log('AI设置已更新:', aiSettings.value)
}

// 按ESC键关闭设置弹窗
const handleEscKey = (event) => {
  if (event.key === 'Escape' && showSettings.value) {
    closeSettings()
  }
}

// 保存对话数据到localStorage
const saveConversations = () => {
  try {
    localStorage.setItem('aiChatConversations', JSON.stringify(conversations.value))
    localStorage.setItem('aiChatCurrentId', currentConversationId.value.toString())
  } catch (error) {
    console.error('保存对话数据失败:', error)
  }
}

// 从localStorage加载对话数据
const loadConversations = () => {
  try {
    const savedConversations = localStorage.getItem('aiChatConversations')
    const savedCurrentId = localStorage.getItem('aiChatCurrentId')

    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations)
      // 恢复Date对象
      parsedConversations.forEach(conv => {
        conv.lastUpdated = new Date(conv.lastUpdated)
        conv.messages.forEach(msg => {
          msg.timestamp = new Date(msg.timestamp)
        })
      })
      conversations.value = parsedConversations
    }

    if (savedCurrentId) {
      const currentId = parseInt(savedCurrentId)
      // 确保当前对话ID存在于对话列表中
      if (conversations.value.find(conv => conv.id === currentId)) {
        currentConversationId.value = currentId
      }
    }
  } catch (error) {
    console.error('加载对话数据失败:', error)
  }
}

// 加载设置
const loadSettings = () => {
  const savedSettings = localStorage.getItem('aiChatSettings')
  if (savedSettings) {
    aiSettings.value = { ...aiSettings.value, ...JSON.parse(savedSettings) }
  }
}

// 监听键盘事件
onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
  loadSettings() // 组件挂载时加载设置
  loadConversations() // 组件挂载时加载对话数据
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
})
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- 侧边栏 -->
    <div
      class="bg-gray-900 text-white transition-all duration-300 flex flex-col"
      :class="isSidebarCollapsed ? 'w-16' : 'w-80'"
    >
      <!-- 侧边栏头部 -->
      <div class="p-4 border-b border-gray-700">
        <div class="flex items-center justify-between">
          <h2 v-if="!isSidebarCollapsed" class="text-lg font-semibold">对话历史</h2>
          <button
            @click="toggleSidebar"
            class="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                :d="isSidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'"/>
            </svg>
          </button>
        </div>

        <button
          v-if="!isSidebarCollapsed"
          @click="newConversation"
          class="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          新建对话
        </button>
      </div>

      <!-- 对话列表 -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-2">
          <div
            v-for="conversation in conversations"
            :key="conversation.id"
            class="group relative mb-2"
          >
            <button
              @click="switchConversation(conversation.id)"
              class="w-full text-left p-3 rounded-lg transition-colors hover:bg-gray-700"
              :class="currentConversationId === conversation.id ? 'bg-gray-700' : ''"
            >
              <div v-if="!isSidebarCollapsed">
                <div class="font-medium text-sm truncate">{{ conversation.title }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ formatTime(conversation.lastUpdated) }}</div>
              </div>
              <div v-else class="w-full h-8 bg-gray-600 rounded flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
            </button>

            <!-- 删除按钮 -->
            <button
              v-if="!isSidebarCollapsed && conversations.length > 1"
              @click="deleteConversation(conversation.id)"
              class="absolute top-3 right-3 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 rounded transition-all"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="flex-1 flex flex-col bg-white">
      <!-- 顶部导航栏 -->
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-800">{{ currentConversation?.title || 'AI 智能助手' }}</h1>
            <p class="text-sm text-gray-500 mt-1">桌面版 ChatGPT 风格对话界面</p>
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="openSettings"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              设置
            </button>
            <button
              @click="clearCurrentChat"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              清空对话
            </button>
          </div>
        </div>
      </header>

      <!-- 消息列表容器 -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto px-6 py-6"
      >
        <div class="max-w-4xl mx-auto space-y-6">
          <!-- 消息项 -->
          <div
            v-for="message in currentMessages"
            :key="message.id"
            class="flex gap-4"
            :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- AI头像 -->
            <div
              v-if="message.type === 'assistant'"
              class="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
            >
              AI
            </div>

            <!-- 消息内容 -->
            <div
              class="max-w-3xl px-5 py-4 rounded-2xl"
              :class="message.type === 'user'
                ? 'bg-blue-500 text-white ml-16'
                : 'bg-gray-50 text-gray-800 mr-16 border border-gray-100'"
            >
              <p class="whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>
              <div
                class="text-xs mt-3 opacity-70"
                :class="message.type === 'user' ? 'text-blue-100' : 'text-gray-500'"
              >
                {{ message.timestamp.toLocaleTimeString() }}
              </div>
            </div>

            <!-- 用户头像 -->
            <div
              v-if="message.type === 'user'"
              class="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
            >
              你
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="flex gap-4">
            <div class="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              AI
            </div>
            <div class="bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100">
              <div class="flex space-x-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="bg-white border-t border-gray-200 px-6 py-4">
        <div class="max-w-4xl mx-auto">
          <div class="flex gap-4 items-end">
            <div class="flex-1 relative">
              <textarea
                v-model="inputMessage"
                @keydown="handleKeydown"
                placeholder="输入你的问题... (Enter发送，Shift+Enter换行，Ctrl+Enter也可换行)"
                rows="1"
                class="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-40 text-base"
                :disabled="isLoading"
              ></textarea>
            </div>
            <button
              @click="sendMessage"
              :disabled="!inputMessage.trim() || isLoading"
              class="px-6 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                v-if="!isLoading"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </button>
          </div>

          <!-- 快捷键提示 -->
          <div class="mt-2 text-xs text-gray-500 text-center">
            快捷键：Enter 发送 | Shift+Enter 换行 | Ctrl+N 新建对话
          </div>
        </div>
      </div>
    </div>

        <!-- 设置弹窗 -->
    <div
      v-if="showSettings"
      class="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-20 flex items-center justify-center z-50"
      @click="closeSettings"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800">AI 对话设置</h2>
          <button
            @click="closeSettings"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-0">
          <ChatSetting @settings-updated="handleSettingsUpdate" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 输入框自动调整高度 */
textarea {
  field-sizing: content;
  line-height: 1.5;
}

/* 动画效果优化 */
.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out both;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 渐变背景动画 */
.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient 3s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
