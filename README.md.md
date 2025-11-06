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
streamlit run health_app.py