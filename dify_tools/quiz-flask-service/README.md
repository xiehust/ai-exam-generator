# 参考来自 (Markdown Quiz Generator)[https://github.com/osandadeshan/markdown-quiz-generator]
## Introduction
It is a tool to generate quizzes from Markdown files.

## 部署方法
1. 构建 Docker 镜像:
```bash
docker build -t quiz-flask-service .
```
2. 启动容器:
```bash
docker run -d --name quiz-flask-service \
  -v $(pwd)/data:/app/data \
  -p 5006:5006 \
  quiz-flask-service
```

