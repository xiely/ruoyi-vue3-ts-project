## 前端运行

```bash

# 安装依赖
npm install

# 不建议使用cnpm安装依赖，可能会出现莫名其妙的问题，npm依赖安装比较慢使用如下方式
npm install --registry=https://registry.npmmirror.com

# 启动服务
npm run dev

# 需要修改端口请自行改动vite.config.ts中server中的port的值
```
浏览器访问 <a href="http://localhost:7000" target="_blank">http://localhost:7000</a>

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

