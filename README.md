# 服务监控 AI 聊天界面

这是一个基于 Vue 3 的 ChatGPT 风格对话界面，现在已集成 DeepSeek API 支持。

## 功能特点

- 🎨 现代化的聊天界面设计
- 💬 多对话管理
- ⚙️ 完整的 API 配置设置
- 🔗 DeepSeek API 集成
- 📱 响应式设计
- 💾 本地设置存储

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 运行项目
```bash
npm run dev
```

### 3. 配置 AI API

1. 点击界面右上角的 "设置" 按钮
2. 选择API服务商：
   - **DeepSeek API** (推荐)
   - **火山引擎 API**
   - 或输入自定义API地址
3. 填写以下信息：
   - **访问密钥**: 你的 API Key
   - **模型名称**: 对应的模型名称
   - **系统提示词**: (可选) 定义 AI 助手的角色和行为
   - **创造性**: 控制回复的创造性程度 (0-1)
   - **最大tokens**: 控制回复长度 (建议 1000-3000)

4. 点击 "测试连接" 验证配置是否正确
5. 点击 "保存设置" 保存配置

## 支持的API服务

### DeepSeek API
- 官网: [https://platform.deepseek.com/](https://platform.deepseek.com/)
- 模型: `deepseek-chat`
- 特点: 性价比高，中文支持好

### 火山引擎 API (字节跳动)
- 官网: [https://console.volcengine.com/ark](https://console.volcengine.com/ark)
- 模型: 根据你的端点配置
- 特点: 国内访问速度快，多模型选择

### 获取API密钥
1. 访问对应平台官网
2. 注册账号并登录
3. 在控制台中创建 API Key
4. 将 API Key 粘贴到设置中

## 使用说明

### 基本聊天
- 在底部输入框输入问题
- 按 Enter 发送消息
- 按 Shift+Enter 换行

### 对话管理
- 点击左侧 "新建对话" 创建新对话
- 点击对话列表切换不同对话
- 点击对话右上角 X 删除对话
- 点击 "清空对话" 清空当前对话

### 快捷键
- `Enter`: 发送消息
- `Shift+Enter`: 换行
- `Ctrl+Enter`: 换行
- `Escape`: 关闭设置弹窗

## 项目结构

```
src/
├── api/
│   └── chat.js          # DeepSeek API 调用逻辑
├── components/
│   ├── ChatInterface.vue # 主聊天界面
│   └── chatSetting.vue   # 设置组件
└── assets/              # 静态资源
```

## 技术栈

- Vue 3 (Composition API)
- Tailwind CSS
- DeepSeek API

## 错误处理

当 API 调用失败时，系统会显示详细的错误信息，包括：
- 网络连接问题
- API 密钥错误
- 服务不可用

请根据错误提示检查配置和网络状况。

## 开发说明

### API 调用流程
1. 用户发送消息
2. 系统将消息历史转换为 DeepSeek API 格式
3. 调用 API 获取回复
4. 显示 AI 回复

### 配置存储
所有设置都保存在浏览器的 localStorage 中，刷新页面后设置会自动恢复。

## 跨域问题解决

### 开发环境
项目已配置 Vite 代理来解决跨域问题：
- DeepSeek API: `/api/deepseek` 代理到 `https://api.deepseek.com`
- 火山引擎 API: `/api/volces` 代理到 `https://ark.cn-beijing.volces.com`
- 开发环境自动使用代理，无需额外配置

### 生产环境
生产环境有以下几种解决方案：

#### 方案1：后端代理（推荐）
创建后端服务作为代理：
```javascript
// Express.js 示例
const { createProxyMiddleware } = require('http-proxy-middleware');

// DeepSeek API 代理
app.use('/api/deepseek', createProxyMiddleware({
  target: 'https://api.deepseek.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/deepseek': ''
  }
}));

// 火山引擎 API 代理
app.use('/api/volces', createProxyMiddleware({
  target: 'https://ark.cn-beijing.volces.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/volces': ''
  }
}));
```

#### 方案2：Nginx 代理
```nginx
# DeepSeek API 代理
location /api/deepseek/ {
    proxy_pass https://api.deepseek.com/;
    proxy_set_header Host api.deepseek.com;
    proxy_set_header Origin https://api.deepseek.com;
}

# 火山引擎 API 代理
location /api/volces/ {
    proxy_pass https://ark.cn-beijing.volces.com/;
    proxy_set_header Host ark.cn-beijing.volces.com;
    proxy_set_header Origin https://ark.cn-beijing.volces.com;
}
```

#### 方案3：直接调用（需CORS支持）
如果API支持CORS或使用浏览器插件，可以直接使用：
`https://api.deepseek.com/chat/completions`

## 注意事项

- 确保 API Key 的安全性，不要在公共场所暴露
- DeepSeek API 可能有使用限制和费用，请查看官方文档
- 建议在生产环境中使用 HTTPS
- 生产环境部署时需要配置后端代理或Nginx代理

## 许可证

MIT License
