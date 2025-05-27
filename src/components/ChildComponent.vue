<template>
  <div class="border border-gray-300 rounded-lg p-4 bg-gray-50">
    <h3 class="text-lg font-medium mb-3 text-gray-700">子组件</h3>

    <div class="space-y-3">
      <div>
        <p class="text-sm text-gray-600">接收到的props:</p>
        <p class="text-blue-600">消息: {{ message }}</p>
        <p class="text-blue-600">计数: {{ count }}</p>
      </div>

      <div>
        <input
          v-model="childMessage"
          placeholder="输入消息发送给父组件"
          class="border border-gray-300 px-3 py-2 rounded w-full max-w-xs"
        >
        <button
          @click="sendMessageToParent"
          class="ml-2 bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
        >
          发送给父组件
        </button>
      </div>

      <div>
        <button
          @click="emitClickEvent"
          class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          触发点击事件
        </button>
      </div>

      <div>
        <p class="text-sm text-gray-600">子组件内部状态:</p>
        <p class="text-green-600">内部计数器: {{ internalCount }}</p>
        <button
          @click="internalCount++"
          class="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm"
        >
          增加内部计数
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 定义props
defineProps({
  message: {
    type: String,
    default: '默认消息'
  },
  count: {
    type: Number,
    default: 0
  }
})

// 定义emits
const emit = defineEmits(['update-message', 'child-clicked'])

// 子组件内部状态
const childMessage = ref('')
const internalCount = ref(0)

// 发送消息给父组件
const sendMessageToParent = () => {
  if (childMessage.value.trim()) {
    emit('update-message', childMessage.value)
    childMessage.value = ''
  }
}

// 触发点击事件
const emitClickEvent = () => {
  emit('child-clicked', `子组件数据: ${internalCount.value}`)
}
</script>

<style scoped>
/* 子组件特定样式 */
</style>
