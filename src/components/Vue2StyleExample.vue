<template>
  <div class="max-w-4xl mx-auto p-6 space-y-8">
    <h1 class="text-3xl font-bold text-center text-red-600 mb-8">Vue2 风格示例 (Options API)</h1>

    <!-- 计数器示例 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">计数器</h2>
      <div class="space-y-4">
        <p class="text-gray-600">计数: {{ count }}</p>
        <div class="space-x-2">
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
        <p class="text-gray-600">双倍计数: {{ doubleCount }}</p>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">用户信息</h2>
      <div class="space-y-2">
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
</template>

<script>
// Vue2 风格 - Options API
export default {
  name: 'Vue2StyleExample',

  // 数据
  data() {
    return {
      count: 0,
      user: {
        name: '',
        email: ''
      }
    }
  },

  // 计算属性
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },

  // 方法
  methods: {
    increment() {
      this.count++  // 注意：Vue2中直接用 this.count，不需要 .value
    },

    decrement() {
      this.count--
    },

    reset() {
      this.count = 0
    }
  },

  // 生命周期
  mounted() {
    console.log('Vue2 组件挂载了')
  },

  // 侦听器
  watch: {
    count(newVal, oldVal) {
      console.log(`计数从 ${oldVal} 变为 ${newVal}`)
    }
  }
}
</script>

<style scoped>
/* 样式 */
</style>
