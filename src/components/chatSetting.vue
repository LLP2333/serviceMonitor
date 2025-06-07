<template>
  <div class="chat-setting">
    <h1>对话设置</h1>

    <div class="setting-form">
      <div class="form-group">
        <label for="apiUrl">API 请求地址:</label>
        <input
          id="apiUrl"
          v-model="settings.apiUrl"
          type="text"
          placeholder="代理地址（开发环境）或完整API地址"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="modelName">模型名称:</label>
        <input
          id="modelName"
          v-model="settings.modelName"
          type="text"
          placeholder="请输入模型名称"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="apiKey">访问密钥:</label>
        <input
          id="apiKey"
          v-model="settings.apiKey"
          type="password"
          placeholder="请输入访问密钥"
          class="form-input"
        />
        <small class="form-hint">DeepSeek API密钥，格式：sk-xxxxxxxx</small>
      </div>

      <div class="form-group">
        <label for="systemPrompt">系统提示词:</label>
        <textarea
          id="systemPrompt"
          v-model="settings.systemPrompt"
          placeholder="可选：设置AI的角色和行为规则"
          class="form-textarea"
          rows="3"
        ></textarea>
        <small class="form-hint">可选：定义AI助手的身份和行为方式</small>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="temperature">创造性 (Temperature):</label>
          <input
            id="temperature"
            v-model.number="settings.temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            class="form-range"
          />
          <div class="range-value">{{ settings.temperature }}</div>
          <small class="form-hint">0=保守，1=创造性</small>
        </div>

        <div class="form-group">
          <label for="maxTokens">最大tokens:</label>
          <input
            id="maxTokens"
            v-model.number="settings.maxTokens"
            type="number"
            min="100"
            max="4000"
            placeholder="2000"
            class="form-input"
          />
          <small class="form-hint">控制回复长度，建议1000-3000</small>
        </div>
      </div>

      <div class="form-actions">
        <button @click="testConnection" class="btn btn-info" :disabled="!settings.apiKey">测试连接</button>
        <button @click="saveSettings" class="btn btn-primary">保存设置</button>
        <button @click="resetSettings" class="btn btn-secondary">重置</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatSetting',
  data() {
    return {
      settings: {
        apiUrl: '/api/chat/api/v3/chat/completions',
        modelName: 'deepseek-chat',
        apiKey: '',
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 2000
      }
    }
  },
  mounted() {
    this.loadSettings()
  },
  methods: {
    loadSettings() {
      // 从本地存储加载设置
      const savedSettings = localStorage.getItem('aiChatSettings')
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
      }
    },
    saveSettings() {
      // 保存设置到本地存储
      localStorage.setItem('aiChatSettings', JSON.stringify(this.settings))
      this.$emit('settings-updated', this.settings)
      alert('设置已保存！')
    },
    resetSettings() {
      this.settings = {
        apiUrl: '/api/chat/chat/completions',
        modelName: 'deepseek-chat',
        apiKey: '',
        systemPrompt: '',
        temperature: 0.7,
        maxTokens: 2000
      }
      localStorage.removeItem('aiChatSettings')
      alert('设置已重置！')
    },
    async testConnection() {
      if (!this.settings.apiKey) {
        alert('请先输入API密钥')
        return
      }

      try {
        // 获取代理URL
        let testUrl = this.settings.apiUrl

                // 开发环境转换为统一的代理路径
        if (import.meta.env.DEV) {
          if (testUrl.includes('api.deepseek.com') ||
              testUrl.includes('ark.cn-beijing.volces.com') ||
              testUrl.includes('api.openai.com')) {
            // 提取路径部分并转换为统一代理路径
            try {
              const urlObj = new URL(testUrl)
              let pathname = urlObj.pathname

              // 智能处理不完整的API端点
              if (testUrl.includes('ark.cn-beijing.volces.com')) {
                // 如果路径不包含完整的端点，自动补全
                if (!pathname.includes('/api/v3/chat/completions')) {
                  if (pathname === '/api' || pathname === '/api/') {
                    pathname = '/api/v3/chat/completions'
                  } else if (!pathname.includes('/v3/chat/completions')) {
                    pathname = pathname.replace(/\/$/, '') + '/v3/chat/completions'
                  }
                }
              } else if (testUrl.includes('api.deepseek.com')) {
                // DeepSeek API处理
                if (!pathname.includes('/chat/completions')) {
                  pathname = '/chat/completions'
                }
              } else if (testUrl.includes('api.openai.com')) {
                // OpenAI API处理
                if (!pathname.includes('/v1/chat/completions')) {
                  pathname = '/v1/chat/completions'
                }
              }

              testUrl = `/api/chat${pathname}`
            } catch {
              // 如果不是完整URL，直接使用
              if (!testUrl.startsWith('/api/chat')) {
                testUrl = '/api/chat/api/v3/chat/completions'
              }
            }
          }
        }

        const response = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.settings.apiKey}`
          },
          body: JSON.stringify({
            model: this.settings.modelName,
            messages: [
              { role: 'user', content: 'Hello' }
            ],
            max_tokens: 10
          })
        })

        if (response.ok) {
          alert('✅ API连接测试成功！')
        } else {
          const error = await response.json().catch(() => ({}))
          alert(`❌ API连接失败：${error.error?.message || response.status}`)
        }
      } catch (error) {
        alert(`❌ 连接测试失败：${error.message}`)
      }
    }
  }
}
</script>

<style scoped>
.chat-setting {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.chat-setting h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.setting-form {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-actions {
  margin-top: 30px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
  font-family: inherit;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-range {
  width: 100%;
  margin: 8px 0;
}

.range-value {
  text-align: center;
  font-weight: bold;
  color: #007bff;
  margin-top: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-hint {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
