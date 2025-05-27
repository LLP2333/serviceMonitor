# Vue2 vs Vue3 详细对比

## 主要区别总结

### 1. 组件写法

#### Vue2 (Options API)
```javascript
export default {
  data() {
    return {
      count: 0
    }
  },
  methods: {
    increment() {
      this.count++  // 直接使用 this.count
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  }
}
```

#### Vue3 (Composition API + `<script setup>`)
```javascript
import { ref, computed } from 'vue'

const count = ref(0)  // 创建响应式引用
const increment = () => count.value++  // 需要使用 .value
const doubleCount = computed(() => count.value * 2)
```

### 2. 关键差异

| 特性 | Vue2 | Vue3 |
|------|------|------|
| **数据声明** | `data()` 函数返回对象 | `ref()` 或 `reactive()` |
| **方法声明** | `methods` 对象 | 直接声明函数 |
| **访问数据** | `this.count` | `count.value` |
| **计算属性** | `computed` 对象 | `computed()` 函数 |
| **生命周期** | `mounted()` 等选项 | `onMounted()` 等函数 |

### 3. 为什么需要 `.value`？

在Vue3中，`ref()` 创建的是一个**响应式引用对象**：

```javascript
const count = ref(0)
console.log(count)        // { value: 0 } - 这是一个对象
console.log(count.value)  // 0 - 这是实际的值
```

**在模板中不需要 `.value`：**
```vue
<template>
  <!-- Vue会自动解包，不需要写 count.value -->
  <p>{{ count }}</p>
</template>
```

**在JavaScript中需要 `.value`：**
```javascript
// ✅ 正确
const increment = () => count.value++

// ❌ 错误
const increment = () => count++
```

### 4. Vue3 的优势

1. **更好的TypeScript支持**
2. **更灵活的代码组织** - 相关逻辑可以放在一起
3. **更好的代码复用** - 可以提取成自定义hooks
4. **更小的包体积** - Tree-shaking支持
5. **更好的性能** - Proxy响应式系统

### 5. 实际例子对比

#### Vue2 风格：
```javascript
export default {
  data() {
    return {
      todos: [],
      newTodo: ''
    }
  },
  methods: {
    addTodo() {
      if (this.newTodo.trim()) {
        this.todos.push({
          id: Date.now(),
          text: this.newTodo,
          completed: false
        })
        this.newTodo = ''
      }
    }
  },
  computed: {
    completedCount() {
      return this.todos.filter(todo => todo.completed).length
    }
  }
}
```

#### Vue3 风格：
```javascript
import { ref, computed } from 'vue'

const todos = ref([])
const newTodo = ref('')

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.value.push({
      id: Date.now(),
      text: newTodo.value,
      completed: false
    })
    newTodo.value = ''
  }
}

const completedCount = computed(() => {
  return todos.value.filter(todo => todo.completed).length
})
```

### 6. 总结

- **Vue2**: 使用 `methods` 对象，通过 `this` 访问数据
- **Vue3**: 直接声明函数，使用 `ref().value` 访问数据
- **Vue3** 的写法更接近原生JavaScript，更灵活，但需要理解 `.value` 的概念

你看到的 `const increment = () => count.value++` 就是Vue3的新写法，它替代了Vue2中的 `methods` 选项！ 