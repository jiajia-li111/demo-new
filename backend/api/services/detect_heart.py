import os
import pandas as pd
import joblib

def detect_heart_simple(
    input_data,
    model_path=os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model', 'train', 'run_out', 'exp1', 'heart_model.pkl'),
    scaler_path=os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model', 'train', 'run_out', 'exp1', 'scaler.pkl'),
    feature_names_path=os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model', 'train', 'run_out', 'exp1', 'feature_names.pkl')
):
    # 加载模型、scaler和特征名
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    feature_names = joblib.load(feature_names_path)

    selected_features = ['age', 'anaemia', 'diabetes', 'high_blood_pressure', 'sex', 'smoking']
    input_dict = {name: None for name in feature_names}

    for i, feat in enumerate(selected_features):
        input_dict[feat] = input_data[i]

    input_df = pd.DataFrame([input_dict])[feature_names]
    input_scaled = scaler.transform(input_df)
    prediction = model.predict(input_scaled)
    prediction_proba = model.predict_proba(input_scaled)

    return {
        "prediction": int(prediction[0]),
        "probability": [float(x) for x in prediction_proba[0]]
    }


