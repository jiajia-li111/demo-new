import pandas as pd
import joblib
import os

def detect_diabetes_simple(
    input_data,
    model_path=os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model', 'train', 'run_out', 'exp2', 'diabetes_model.pkl'),
    scaler_path=os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model', 'train', 'run_out', 'exp2', 'scaler.pkl'),
    feature_names_path=os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model', 'train', 'run_out', 'exp2', 'feature_names.pkl')
):
    # 只保留需要的特征
    selected_features = ['BloodPressure', 'Age', 'BMI', 'Pregnancies']
    # 加载模型、scaler和特征名
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    feature_names = joblib.load(feature_names_path)
    # 构造完整输入
    input_dict = {name: None for name in feature_names}
    for i, feat in enumerate(selected_features):
        input_dict[feat] = input_data[i]
    # 构造DataFrame
    input_df = pd.DataFrame([input_dict])
    # 只保留训练时的特征顺序
    input_df = input_df[feature_names]
    # 标准化
    input_scaled = scaler.transform(input_df)
    # 预测
    prediction = model.predict(input_scaled)
    prediction_proba = model.predict_proba(input_scaled)
    return {
        'prediction': int(prediction[0]),
        'probability': prediction_proba[0].tolist()
    }


