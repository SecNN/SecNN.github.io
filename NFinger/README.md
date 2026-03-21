# NFinger 溯纹 | AI 智能分析 Web应用指纹识别与资产发现

## 📜 描述

NFinger（溯纹）是一款基于AI智能分析的Web应用指纹识别工具，具备高效、可扩展的特性。它支持高精度CMS识别、框架检测及中间件指纹匹配，通过多维度特征分析，能够快速、精准地识别网站技术栈，有效助力安全审计、资产梳理与漏洞排查工作。

项目主页：https://NFinger.SecNN.com

```
 ██████   █████ ███████████  ███                                        
▒▒██████ ▒▒███ ▒▒███▒▒▒▒▒▒█ ▒▒▒                                         
 ▒███▒███ ▒███  ▒███   █ ▒  ████  ████████    ███████  ██████  ████████ 
 ▒███▒▒███▒███  ▒███████   ▒▒███ ▒▒███▒▒███  ███▒▒███ ███▒▒███▒▒███▒▒███
 ▒███ ▒▒██████  ▒███▒▒▒█    ▒███  ▒███ ▒███ ▒███ ▒███▒███████  ▒███ ▒▒▒ 
 ▒███  ▒▒█████  ▒███  ▒     ▒███  ▒███ ▒███ ▒███ ▒███▒███▒▒▒   ▒███     
 █████  ▒▒█████ █████       █████ ████ █████▒▒███████▒▒██████  █████    
▒▒▒▒▒    ▒▒▒▒▒ ▒▒▒▒▒       ▒▒▒▒▒ ▒▒▒▒ ▒▒▒▒▒  ▒▒▒▒▒███ ▒▒▒▒▒▒  ▒▒▒▒▒     
                                             ███ ▒███                   
                                            ▒▒██████                    
                                             ▒▒▒▒▒▒                         
```

## ✨ 功能特性

- 🤖 **AI 智能分析**: 集成 AI 分析功能，自动识别技术栈并提供安全建议
- 🌐 **Web 版本**: 提供图形化 Web 界面，支持浏览器访问
- 🔍 **指纹识别**: 基于多种规则识别 Web 应用指纹（CMS、框架、技术栈等）
- 🌐 **IP 归属地查询**: 自动解析域名并查询 IP 归属地
- 🎯 **Favicon 识别**: 计算 Favicon 的 mmh3 和 md5 哈希值
- 📊 **网络资产测绘**: 生成 FOFA、Shodan、ZoomEye 等平台的查询语法
- 🤖 **Robots.txt 扫描**: 自动访问并分析 robots.txt 文件
- 💻 **开发语言识别**: 自动识别 PHP、JSP、ASPX、ASP 等开发语言
- 📝 **ICP 备案识别**: 自动提取网页中的 ICP 备案号
- 🚀 **多线程扫描**: 支持多线程批量扫描，提高扫描效率
- 📄 **多种导出格式**: 支持 HTML、Markdown、Excel 三种格式导出
- 📊 **多目标扫描**：支持批量扫描和单个目标扫描
- 🔄 **自动重试**: 请求失败时自动重试机制（最多3次）
- 🎨 **美观的 HTML 报告**: 生成响应式的可视化扫描报告
- 📈 **实时进度显示**: 扫描过程中实时显示进度和统计信息
- 🎭 **随机 User-Agent**: 模拟多种浏览器访问
- 🌍 **跨平台支持**：Windows、Linux、macOS 全平台兼容
- 🔒 **安全可靠**：指纹数据加密存储
- 🚀 **高性能**：支持并发扫描

## 🤖 AI 大模型配置

🔧编辑 `config/config.ini`或在 Web 界面中临时配置。

```ini
[AI]
# AI 大模型配置
# 支持的模型：OpenAI API、Ollama 本地模型、其他兼容 OpenAI API 的模型

# API 地址（必填）
# OpenAI: https://api.openai.com/v1
# Deepseek: https://api.deepseek.com
# 硅基流动: https://://api.siliconflow.cn/v1
# Ollama: http://127.0.0.1:11434/v1
# SecNN API: https://api.secnn.com/v1
# 其他兼容 OpenAI API 的服务：请查看对应服务的文档
base_url = 

# API Key 密钥（可选）
# Ollama: 可以留空
# 其他服务: 根据服务要求填写
api_key = 

# 模型名称（必填）
# OpenAI: gpt-3.5-turbo, gpt-4, gpt-4-turbo 等
# Deepseek: deepseek-chat, deepseek-reasoner 等
# 硅基流动: Pro/deepseek-ai/DeepSeek-V3.2-Exp , Qwen/Qwen3.5-397B-A17B 等
# Ollama: deepseek-r1:14b, llama2:7b 等（根据本地安装的模型）
# 其他服务: 根据服务支持的模型填写
model = 
```

## 🚀使用方法

### 基本用法

```bash
# 扫描单个目标
NFinger_CLI -u http://example.com

# AI 智能分析
NFinger_CLI -u http://example.com  --ai

# 批量扫描（从文件读取目标）
NFinger_CLI -f targets.txt
## 创建一个文本文件（如 `targets.txt`），每行一个目标 URL：
http://example.com
https://test.com
http://192.168.1.1:8080
example.org
192.168.1.1

# 指定线程数进行批量扫描
NFinger_CLI -f targets.txt -t 20

# 批量扫描并启用 AI 分析
NFinger_CLI -f targets.txt --ai

# 在线更新指纹库
NFinger_CLI --update
```

### 命令行参数

| 参数            | 说明                                   |
| --------------- | -------------------------------------- |
| `-u, --url`     | 指定单个目标 URL 或 IP                 |
| `-f, --file`    | 指定包含多个目标的文件（每行一个 URL） |
| `-t, --threads` | 设置线程数，默认为 10                  |
| `-o, --output`  | 指定输出文件名前缀（不含扩展名）       |
| `--html`        | 导出为 HTML 格式                       |
| `--md`          | 导出为 Markdown 格式                   |
| `--xlsx`        | 导出为 Excel 格式                      |
| `--all`         | 导出所有格式                           |
| `--update`      | 在线更新指纹库                         |
| `--ai`          | 使用 AI 分析功能                       |

### 访问 Web 界面

启动 Web 服务，通过浏览器访问图形化界面：

```bash
运行  NFinger_WEB
```

🌐服务启动后，在浏览器中访问地址: `http://localhost:20000`

## 配置本地大模型-🏠本地私有部署

使用**Ollama**进行测试

```
API地址（URL）：http://127.0.0.1:11434/v1
API密钥（KEY）：
大模型（Model）：deepseek-r1:14b
```

## DeepSeek

https://platform.deepseek.com/sign_in

```
API地址（URL）：https://api.deepseek.com
API密钥（KEY）：sk-xxxxxx
大模型（Model）：deepseek-chat   &&  deepseek-reasoner
```

##  硅基流动（SiliconFlow）

https://cloud.siliconflow.cn/i/FN4rN9cn

```
API地址（URL）：https://api.siliconflow.cn/v1
API密钥（KEY）：sk-xxxxxx
大模型（Model）：Pro/deepseek-ai/DeepSeek-V3.2-Exp  && Qwen/Qwen3.5-397B-A17B
```

## SecNN 大模型

https://api.secnn.com/pricing

```
API地址（url）：https://api.secnn.cn/v1
API密钥（KEY）：sk-xxxxxx
大模型（model）：deepseek-v3.1:671b-cloud
```

## 📊 API 接口

### 单个目标扫描

**请求:**

```http
POST /api/scan
Host: 127.0.0.1:20000
Content-Type: application/json

{
  "target": "http://secnn.com"
}
```

**响应:**

```json
{
  "target": "http://secnn.com",
  "status": "success",
  "status_code": 200,
  "title": "Example Domain",
  "ip_address": "93.184.216.34",
  "server": "ECS (dcb/7A8E)",
  "languages": ["PHP"],
  "icp": "",
  "fingerprints": [
    {
      "name": "WordPress",
      "type": "cms",
      "version": "unknown"
    }
  ],
  "favicon_hash": 123456789,
  "favicon_md5": "abc123..."
}
```

### 批量扫描

**请求:**

```http
POST /api/batch_scan
Host: 127.0.0.1:20000
Content-Type: application/json

{
  "targets": [
    "http://example.com",
    "https://test.com"
  ],
  "threads": 10
}
```

**响应:**

```json
{
  "results": [
    {
      "target": "http://example.com",
      "status": "success",
      ...
    },
    {
      "target": "https://test.com",
      "status": "success",
      ...
    }
  ]
}
```

### AI 分析

```http
POST /api/ai_analyze
Host: 127.0.0.1:20000
Content-Type: application/json

{
    "scan_result": {...},
    "ai_config": {
        "base_url": "...",
        "api_key": "...",
        "model": "..."
    }
}
```

## 📁 项目结构

```
NFinger/
├── NFinger                    # 主程序文件
├── web/                       # Web 前端调用
│   └── templates/
│       └── index.html         # Web 界面模板
├── data/
│   ├── ip2region.xdb          # IP 归属地数据库
│   └── fingerprints.db        # 加密指纹规则库
├── output/                    # 扫描结果输出目录
├── targets.txt                # 目标列表文件（示例）
└── README.md                  # 项目说明文档
```

## 常见问题

### Q: 如何启动 Web 服务？

A: 运行 `NFinger_WEB` 启动服务。

### Q: 如何访问 Web 界面？

A: 服务启动后，在浏览器中访问 `http://localhost:20000`。

### Q: 批量扫描速度慢怎么办？

A: 以增加线程数（`-t` 参数），但请注意不要设置过高以免对目标服务器造成压力。

### Q: 指纹库加载失败怎么办？

A: 确保 `data/fingerprints.db` 文件存在且格式正确，`--update`  在线更新指纹库。

### Q: 如何添加自定义指纹规则？

A: 暂未开通自定义指纹库，需要添加指纹可WX联系：SecNN-

### Q: 如何只导出特定格式？

A: 使用对应的参数，如 `--html`、`--md` 或 `--xlsx`。

### Q: IP 归属地查询失败怎么办？

A: 确保 `data/ip2region.xdb` 文件存在且完整。

### Q: Favicon 哈希计算失败？

A: 某些网站可能没有 favicon 或路径非常规，工具会尝试多种常见路径获取。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

**Made with ❤️ by SecNN**

