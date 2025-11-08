# README.md

本部分设计为predic和train两个部分，结构如下：

```bash
|---predic
	|--detect_and_get #用于实现机器学习的预测和对deepseek调用
	|--input #需要前端硬件端输入数据的路径，格式同训练数据集中的一致
	|--output #返回的信息将以文本.txt，如果可以有附加的健康数据的可视化
	
|--train
	|--data #训练数据集
	|--run_out #训练出的权重
	|--src #训练模型
```
cd "C:\Users\17818\Downloads\DEMO\demo-project\train\src"
python app.py

cd "C:\Users\17818\Downloads\DEMO\demo-project\train\src"
streamlit run streamlit_front.py









项目结构的优化方案
demo-project/
│
├── app/
│   ├── __init__.py              # 创建 Flask app 的工厂函数，加载配置、注册蓝图
│   ├── config.py                # 环境配置（数据库、密钥、日志等）
│   ├── extensions.py            # 第三方插件初始化（如 SQLAlchemy、JWT、CORS）
│
│   ├── models/                  # 数据层
│   │   ├── __init__.py
│   │   └── user.py              # 用户模型、ORM定义等
│
│   ├── routes/                  # 路由层（Flask 蓝图）
│   │   ├── __init__.py
│   │   ├── auth_routes.py       # 登录注册接口
│   │   ├── data_routes.py       # 数据查询接口
│   │   ├── detect_routes.py     # 各类检测接口
│   │   └── health_routes.py     # 系统健康/心跳检测接口
│
│   ├── services/                # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── detect_service.py
│   │   └── deepseek_service.py
│
│   ├── utils/                   # 工具函数层
│   │   ├── __init__.py
│   │   ├── database.py          # 封装数据库连接与操作函数
│   │   ├── security.py          # 密码加密、Token 生成
│   │   ├── validators.py        # 参数校验
│   │   └── response.py          # 标准化返回格式
│
│   └── static/ & templates/     # 前端静态文件和模板（如 HTML/CSS/JS）
│
├── core/
│   ├── train/                   # 模型训练逻辑
│   ├── predict/                 # 模型预测逻辑
│   ├── detect/                  # 各类检测算法文件
│   └── deepseek/                # AI 模块，如 DeepSeek 模型封装
│
├── tests/                       # 单元测试
│   ├── test_auth.py
│   ├── test_detect.py
│   └── ...
│
├── run.py                       # 启动入口（加载 app/__init__.py）
├── requirements.txt
├── README.md
└── .gitignore
