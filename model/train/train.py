import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import joblib


# ===================== 1. 数据加载 =====================
def load_data(file_path):
    """加载数据集"""
    try:
        df = pd.read_csv(file_path)
        print(f"✅ 成功加载数据：{file_path}")
        df.info()

        rows, cols = df.shape
        print(f"数据集包含 {rows} 行，{cols} 列")

        if rows < 100:
            print(f"⚠️ 样本数较少（{rows} 条），可能影响模型泛化能力")

        if df.isnull().sum().sum() > 0:
            print("⚠️ 数据集中存在缺失值，将在后续步骤中删除")
        else:
            print("✅ 数据集中不存在缺失值")

        return df
    except FileNotFoundError:
        print(f"❌ 错误：未找到文件 {file_path}")
        return None
    except Exception as e:
        print(f"❌ 加载数据时出现异常：{e}")
        return None


# ===================== 2. 数据预处理 =====================
def preprocess_data(df, out_dir='train/run_out'):
    """预处理数据"""
    if df is None:
        print("❌ 数据为空，无法预处理。")
        return None, None, None, None, None, None

    df = df.dropna()
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    feature_names = X.columns.tolist()

    os.makedirs(out_dir, exist_ok=True)
    joblib.dump(scaler, f'{out_dir}/scaler.pkl')
    joblib.dump(feature_names, f'{out_dir}/feature_names.pkl')
    print(f"✅ 数据预处理完成，已保存 scaler 和 feature_names 至 {out_dir}")

    return X_train_scaled, X_test_scaled, y_train, y_test, X_train, X_test


# ===================== 3. 模型训练 =====================
def train_model(X_train_scaled, y_train, n_estimators=100, random_state=42):
    """训练随机森林分类器"""
    if X_train_scaled is None or y_train is None:
        print("❌ 无法训练模型，输入数据为空。")
        return None

    model = RandomForestClassifier(n_estimators=n_estimators, random_state=random_state)
    model.fit(X_train_scaled, y_train)
    print("✅ 模型训练完成")
    return model


# ===================== 4. 保存模型 =====================
def save_model(model, model_path):
    """保存模型"""
    if model is not None:
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        joblib.dump(model, model_path)
        print(f"💾 模型已保存至：{model_path}")


# ===================== 5. 加载模型 =====================
def load_model(model_path):
    """加载模型"""
    try:
        model = joblib.load(model_path)
        print(f"✅ 成功加载模型：{model_path}")
        return model
    except FileNotFoundError:
        print(f"❌ 找不到模型文件：{model_path}")
        return None
    except Exception as e:
        print(f"❌ 加载模型出现异常：{e}")
        return None


# ===================== 6. 模型评估 =====================
def evaluate_model(model, X_test_scaled, y_test):
    """评估模型性能"""
    if model is None or X_test_scaled is None or y_test is None:
        print("❌ 评估失败：模型或测试数据为空。")
        return None

    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"🎯 模型准确率: {accuracy:.4f}")
    print("分类报告：")
    print(classification_report(y_test, y_pred))
    return y_pred


# ===================== 7. 特征重要性分析 =====================
def analyze_feature_importance(model, X_train, out_dir='train/run_out', top_n=10):
    """分析特征重要性"""
    if model is None or X_train is None:
        return None

    importance = model.feature_importances_
    feature_names = X_train.columns

    importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importance
    }).sort_values('Importance', ascending=False).head(top_n)

    os.makedirs(out_dir, exist_ok=True)
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=importance_df)
    plt.title('特征重要性分析')
    plt.tight_layout()
    plt.savefig(f'{out_dir}/feature_importance.png')
    plt.close()

    print(f"📊 特征重要性图已保存至 {out_dir}/feature_importance.png")
    return importance_df


# ===================== 8. 可视化结果 =====================
def visualize_results(y_test, y_pred, out_dir='train/run_out'):
    """可视化混淆矩阵"""
    if y_test is None or y_pred is None:
        return

    cm = confusion_matrix(y_test, y_pred)
    os.makedirs(out_dir, exist_ok=True)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.xlabel('预测值')
    plt.ylabel('真实值')
    plt.title('混淆矩阵')
    plt.tight_layout()
    plt.savefig(f'{out_dir}/confusion_matrix.png')
    plt.close()
    print(f"📈 混淆矩阵图已保存至 {out_dir}/confusion_matrix.png")


# ===================== 9. 预测函数 =====================
def detect_disease(
    input_data,
    model_path,
    scaler_path,
    feature_names_path
):
    """使用训练好的模型进行预测"""
    model = load_model(model_path)
    if model is None:
        return None

    scaler = joblib.load(scaler_path)
    feature_names = joblib.load(feature_names_path)

    if not isinstance(input_data, pd.DataFrame):
        input_data = pd.DataFrame([input_data], columns=feature_names)

    input_scaled = scaler.transform(input_data)
    prediction = model.predict(input_scaled)
    prediction_proba = model.predict_proba(input_scaled)

    return {
        'prediction': prediction[0],
        'probability': prediction_proba[0].tolist()
    }


# ===================== 10. 主函数 =====================
def main():
    # === 自动识别要使用的数据集 ===
    base_dir = os.path.dirname(__file__)
    data_dir = os.path.join(base_dir, "data")

    # 你可以换成下面任意一个文件名即可：
    dataset_name = "heart_failure_reduced.csv"  # ✅ 可改成 diabetes_reduced.csv
    file_path = os.path.join(data_dir, dataset_name)

    # 自动生成输出目录（按数据集名称区分）
    dataset_short = os.path.splitext(dataset_name)[0]
    out_dir = os.path.join(base_dir, "run_out", dataset_short)

    print(f"\n🔍 当前数据集：{dataset_name}")
    print(f"📁 数据文件路径：{file_path}")

    df = load_data(file_path)
    if df is None:
        print("❌ 数据加载失败，程序退出。")
        return

    X_train_scaled, X_test_scaled, y_train, y_test, X_train, X_test = preprocess_data(df, out_dir=out_dir)
    model = train_model(X_train_scaled, y_train)
    model_path = os.path.join(out_dir, f"{dataset_short}_model.pkl")

    save_model(model, model_path)
    y_pred = evaluate_model(model, X_test_scaled, y_test)

    importance_df = analyze_feature_importance(model, X_train, out_dir=out_dir)
    if importance_df is not None:
        print("\n特征重要性前10：")
        print(importance_df)

    visualize_results(y_test, y_pred, out_dir=out_dir)

    # 示例预测
    sample_input = X_test.iloc[0].tolist()
    result = detect_disease(
        sample_input,
        model_path=model_path,
        scaler_path=os.path.join(out_dir, "scaler.pkl"),
        feature_names_path=os.path.join(out_dir, "feature_names.pkl")
    )
    if result:
        print("\n🧠 示例预测结果：")
        print(f"预测类别: {result['prediction']}")
        print(f"预测概率: {result['probability']}")


if __name__ == "__main__":
    main()
