// API 调用接口
// 开发环境使用代理，生产环境使用直接API
const DEFAULT_API_URL = import.meta.env.DEV
  ? '/api/chat/api/v3/chat/completions'  // 开发环境代理路径
  : 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'  // 生产环境直接调用（默认火山引擎）
const DEFAULT_MODEL = 'deepseek-chat'

/**
 * 获取代理URL - 开发环境自动转换为代理路径
 * @param {string} originalUrl - 原始API URL
 * @returns {string} 处理后的URL
 */
function getProxyUrl(originalUrl) {
  if (!import.meta.env.DEV) {
    return originalUrl // 生产环境直接返回原始URL
  }

  // 开发环境统一转换为 /api/chat 代理路径
  if (originalUrl.includes('api.deepseek.com') ||
      originalUrl.includes('ark.cn-beijing.volces.com') ||
      originalUrl.includes('api.openai.com')) {

    const urlObj = new URL(originalUrl)
    let pathname = urlObj.pathname

    // 智能处理不完整的API端点
    if (originalUrl.includes('ark.cn-beijing.volces.com')) {
      // 如果路径不包含完整的端点，自动补全
      if (!pathname.includes('/api/v3/chat/completions')) {
        if (pathname === '/api' || pathname === '/api/') {
          pathname = '/api/v3/chat/completions'
        } else if (!pathname.includes('/v3/chat/completions')) {
          pathname = pathname.replace(/\/$/, '') + '/v3/chat/completions'
        }
      }
    } else if (originalUrl.includes('api.deepseek.com')) {
      // DeepSeek API处理
      if (!pathname.includes('/chat/completions')) {
        pathname = '/chat/completions'
      }
    } else if (originalUrl.includes('api.openai.com')) {
      // OpenAI API处理
      if (!pathname.includes('/v1/chat/completions')) {
        pathname = '/v1/chat/completions'
      }
    }

    return `/api/chat${pathname}`
  }

  // 如果不匹配已知的API，返回原始URL
  return originalUrl
}

/**
 * 调用DeepSeek API获取AI回复
 * @param {Array} messages - 消息历史数组
 * @param {Object} settings - API设置
 * @returns {Promise<string>} AI回复内容
 */
export async function getAIResponse(messages, settings = {}) {
  const originalApiUrl = settings.apiUrl || DEFAULT_API_URL
  const apiUrl = getProxyUrl(originalApiUrl)  // 使用代理URL函数
  const modelName = settings.modelName || DEFAULT_MODEL
  const apiKey = settings.apiKey

  if (!apiKey) {
    throw new Error('请在设置中配置API密钥')
  }

  try {
    // 构建请求数据
    const requestData = {
      model: modelName,
      messages: messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      stream: false,
      temperature: settings.temperature || 0.7,
      max_tokens: settings.maxTokens || 2000
    }

    // 添加系统提示（如果有）
    if (settings.systemPrompt) {
      requestData.messages.unshift({
        role: 'system',
        content: settings.systemPrompt
      })
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`)
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('API返回数据格式错误')
    }

    return data.choices[0].message.content
  } catch (error) {
    console.error('API调用失败:', error)
    throw error
  }
}

/**
 * 测试API连接
 * @param {Object} settings - API设置
 * @returns {Promise<boolean>} 连接是否成功
 */
export async function testAPIConnection(settings) {
  try {
    const testMessages = [
      { type: 'user', content: 'Hello' }
    ]
    await getAIResponse(testMessages, settings)
    return true
  } catch (error) {
    console.error('API连接测试失败:', error)
    return false
  }
}
