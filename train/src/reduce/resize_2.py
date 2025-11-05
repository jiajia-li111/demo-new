import pandas as pd

# 读取原始数据
df = pd.read_csv('train/data/diabetes.csv')

# 删除指定列
df_new = df.drop(columns=['Glucose', 'Insulin', 'DiabetesPedigreeFunction', 'SkinThickness'])

# 保存为新文件
df_new.to_csv('train/data/diabetes_reduced.csv', index=False)