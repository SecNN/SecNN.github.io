# NFinger 溯纹

> **The Multi-Fingerprint Scanner for Web**

一个强大的 Web 指纹识别工具，支持多线程批量扫描、多种导出格式和详细的资产信息收集。

![Python](https://img.shields.io/badge/Python-3.x-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 功能特性

- 🔍 **指纹识别**: 基于多种规则识别 Web 应用指纹（CMS、框架、技术栈等）
- 🌐 **IP 归属地查询**: 自动解析域名并查询 IP 归属地
- 🎯 **Favicon 识别**: 计算 Favicon 的 mmh3 和 md5 哈希值
- 📊 **网络资产测绘**: 生成 FOFA、Shodan、ZoomEye 等平台的查询语法
- 🤖 **Robots.txt 扫描**: 自动访问并分析 robots.txt 文件
- 💻 **开发语言识别**: 自动识别 PHP、JSP、ASPX、ASP 等开发语言
- 📝 **ICP 备案识别**: 自动提取网页中的 ICP 备案号
- 🚀 **多线程扫描**: 支持多线程批量扫描，提高扫描效率
- 📄 **多种导出格式**: 支持 HTML、Markdown、Excel 三种格式导出
- 🔄 **自动重试**: 请求失败时自动重试机制（最多3次）
- 🎨 **美观的 HTML 报告**: 生成响应式的可视化扫描报告
- 📈 **实时进度显示**: 扫描过程中实时显示进度和统计信息
- 🎭 **随机 User-Agent**: 模拟多种浏览器访问
