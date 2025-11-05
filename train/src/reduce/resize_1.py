import pandas as pd

df = pd.read_csv('train\data\heart_failure_clinical_records_dataset.csv')

# 删除指定列
df_new = df.drop(columns=[
    'creatinine_phosphokinase',
    'ejection_fraction',
    'platelets',
    'serum_creatinine',
    'serum_sodium',
    'time'  # 删除时间列
])

df_new.to_csv('train\data\heart_failure_reduced.csv', index=False)