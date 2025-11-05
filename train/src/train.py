import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import joblib  # 新增导入joblib库用于模型保存和加载

# 1. 数据加载与探索
def load_data(file_path):
    """加载糖尿病数据集"""
    try:
        df = pd.read_csv(file_path)
        print(f"数据基本信息：")
        df.info()
        
        # 显示数据集行数和列数
        rows, columns = df.shape
        
        if rows < 100:
            print(f"警告：数据集样本数较少（{rows}条），可能导致模型泛化能力不足")
        
        # 检查数据集中是否存在缺失值
        if df.isnull().sum().sum() > 0:
            print("数据集中存在缺失值，需要进行预处理")
        else:
            print("数据集中不存在缺失值")
            
        return df
    except FileNotFoundError:
        print(f"错误：找不到文件 {file_path}")
        return None
    except Exception as e:
        print(f"错误：加载数据时出现异常 {e}")
        return None

# 2. 数据预处理
def preprocess_data(df, out_dir='train/run_out'):
    """预处理糖尿病数据集"""
    if df is None:
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
    import os
    os.makedirs(out_dir, exist_ok=True)
    joblib.dump(scaler, f'{out_dir}/scaler.pkl')
    joblib.dump(feature_names, f'{out_dir}/feature_names.pkl')
    return X_train_scaled, X_test_scaled, y_train, y_test, X_train, X_test

# 3. 模型训练
def train_model(X_train_scaled, y_train, n_estimators=100, random_state=42):
    """训练随机森林分类器"""
    if X_train_scaled is None or y_train is None:
        return None
    
    model = RandomForestClassifier(n_estimators=n_estimators, random_state=random_state)
    model.fit(X_train_scaled, y_train)
    
    return model

# 4. 保存模型
def save_model(model, model_path='train/run_out/diabetes_model.pkl'):
    """保存训练好的模型"""
    if model is not None:
        joblib.dump(model, model_path)
        print(f"模型已保存至 {model_path}")

# 5. 加载模型
def load_model(model_path='train/run_out/diabetes_model.pkl'):
    """加载已保存的模型"""
    try:
        model = joblib.load(model_path)
        return model
    except FileNotFoundError:
        print(f"错误：找不到模型文件 {model_path}")
        return None
    except Exception as e:
        print(f"错误：加载模型时出现异常 {e}")
        return None

# 6. 模型评估
def evaluate_model(model, X_test_scaled, y_test):
    """评估模型性能"""
    if model is None or X_test_scaled is None or y_test is None:
        return
    
    # 预测
    y_pred = model.predict(X_test_scaled)
    
    # 计算准确率
    accuracy = accuracy_score(y_test, y_pred)
    print(f"模型准确率: {accuracy:.4f}")
    
    # 打印分类报告
    print("分类报告:")
    print(classification_report(y_test, y_pred))
    
    # 返回预测结果
    return y_pred

# 7. 特征重要性分析
def analyze_feature_importance(model, X_train, out_dir='train/run_out', top_n=10):
    """分析特征重要性"""
    if model is None or X_train is None:
        return
    
    # 获取特征重要性
    importance = model.feature_importances_
    
    # 获取特征名称
    feature_names = X_train.columns
    
    # 创建DataFrame
    importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importance
    })
    
    # 按重要性排序
    importance_df = importance_df.sort_values('Importance', ascending=False).head(top_n)
    import os
    os.makedirs(out_dir, exist_ok=True)
    # 可视化
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=importance_df)
    plt.title('特征重要性分析')
    plt.tight_layout()
    plt.savefig(f'{out_dir}/feature_importance.png')
    plt.close()
    
    return importance_df

# 8. 结果可视化
def visualize_results(y_test, y_pred, out_dir='train/run_out'):
    """可视化模型预测结果"""
    if y_test is None or y_pred is None:
        return
    
    # 混淆矩阵
    cm = confusion_matrix(y_test, y_pred)
    import os
    os.makedirs(out_dir, exist_ok=True)
    # 可视化混淆矩阵
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.xlabel('预测值')
    plt.ylabel('真实值')
    plt.title('混淆矩阵')
    plt.tight_layout()
    plt.savefig(f'{out_dir}/confusion_matrix.png')
    plt.close()

# 9. 超参数优化（示例：网格搜索）
def optimize_hyperparameters(X_train_scaled, y_train):
    """使用网格搜索优化超参数"""
    from sklearn.model_selection import GridSearchCV
    
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 10, 20, 30],
        'min_samples_split': [2, 5, 10]
    }
    
    model = RandomForestClassifier(random_state=42)
    
    grid_search = GridSearchCV(
        estimator=model,
        param_grid=param_grid,
        cv=5,
        n_jobs=-1,
        scoring='accuracy',
        verbose=2
    )
    
    grid_search.fit(X_train_scaled, y_train)
    
    print("最佳参数:", grid_search.best_params_)
    print("最佳得分:", grid_search.best_score_)
    
    return grid_search.best_estimator_

# 10. 检测程序示例
def detect_diabetes(
    input_data,
    model_path='train/run_out/diabetes_model.pkl',
    scaler_path='train/run_out/scaler.pkl',
    feature_names_path='train/run_out/feature_names.pkl'
):
    """使用训练好的模型进行糖尿病检测"""
    model = load_model(model_path)
    scaler = joblib.load(scaler_path)
    feature_names = joblib.load(feature_names_path)
    if model is None or scaler is None:
        return None
    if not isinstance(input_data, pd.DataFrame):
        input_data = pd.DataFrame([input_data], columns=feature_names)
    input_scaled = scaler.transform(input_data)
    prediction = model.predict(input_scaled)
    prediction_proba = model.predict_proba(input_scaled)
    return {
        'prediction': prediction[0],
        'probability': prediction_proba[0].tolist()
    }

# 主函数
def main():
    # 1. 加载数据，改为新的数据集
    file_path = 'train/data/heart_failure_reduced.csv'  # 新数据集路径
    out_dir = 'train/run_out/exp1'  # 训练结果输出到exp1
    df = load_data(file_path)
    
    # 2. 数据预处理
    X_train_scaled, X_test_scaled, y_train, y_test, X_train, X_test = preprocess_data(df, out_dir=out_dir)
    
    # 3. 训练基础模型
    model = train_model(X_train_scaled, y_train)
    
    # 4. 保存模型
    save_model(model, model_path=f'{out_dir}/heart_model.pkl')
    
    # 5. 评估模型
    y_pred = evaluate_model(model, X_test_scaled, y_test)
    
    # 6. 特征重要性分析
    importance_df = analyze_feature_importance(model, X_train, out_dir=out_dir)
    print("特征重要性:")
    print(importance_df)
    
    # 7. 可视化结果
    visualize_results(y_test, y_pred, out_dir=out_dir)
    
    # 8. 超参数优化（可选，取消注释以运行）
    # best_model = optimize_hyperparameters(X_train_scaled, y_train)
    # save_model(best_model, model_path=f'{out_dir}/diabetes_model_optimized.pkl')
    # y_pred_optimized = evaluate_model(best_model, X_test_scaled, y_test)
    
    # 9. 示例：使用保存的模型进行预测
    sample_input = X_test.iloc[0].tolist()
    result = detect_diabetes(
        sample_input,
        model_path=f'{out_dir}/heart_model.pkl',
        scaler_path=f'{out_dir}/scaler.pkl',
        feature_names_path=f'{out_dir}/feature_names.pkl'
    )
    if result:
        print("\n示例预测结果:")
        print(f"预测类别: {result['prediction']}")
        print(f"预测概率: {result['probability']}")

if __name__ == "__main__":
    main()