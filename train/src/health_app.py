import streamlit as st
from streamlit_autorefresh import st_autorefresh
import requests
import pandas as pd
import os

import sys

from datetime import datetime

# 获取当前文件所在目录的绝对路径
current_dir = os.path.dirname(os.path.abspath(__file__))
# 将当前目录加入sys.path
if current_dir not in sys.path:
    sys.path.append(current_dir)

import streamlit as st
FLASK_BASE_URL = "http://127.0.0.1:5000"
API_BASE = FLASK_BASE_URL

def render_login_page():
    """登录 / 注册 页面"""
    st.title("🔐 用户登录")
    st.caption("登录后即可访问健康风险预测与管理系统")

    username = st.text_input("用户名")
    password = st.text_input("密码", type="password")

    col1, col2 = st.columns(2)

    # 登录按钮
    with col1:
        if st.button("登录", use_container_width=True):
            if not username or not password:
                st.warning("请输入用户名和密码！")
            else:
                try:
                    res = requests.post(
                        f"{API_BASE}/login",
                        json={"username": username, "password": password},
                        timeout=5
                    )
                    result = res.json()
                    if result.get("success"):
                        st.session_state.authenticated = True
                        st.session_state.username = username
                        st.success("✅ 登录成功！")
                        st.rerun()
                    else:
                        st.error(result.get("message", "登录失败"))
                except Exception as e:
                    st.error(f"无法连接后端：{e}")

    # 注册按钮
    with col2:
        if st.button("注册新用户", use_container_width=True):
            if not username or not password:
                st.warning("请输入用户名和密码！")
            else:
                try:
                    res = requests.post(
                        f"{API_BASE}/register",
                        json={"username": username, "password": password},
                        timeout=5
                    )
                    result = res.json()
                    if result.get("success"):
                        st.success("✅ 注册成功，请重新登录！")
                    else:
                        st.error(result.get("message", "注册失败"))
                except Exception as e:
                    st.error(f"无法连接后端：{e}")


def render_health_reference_dashboard():
    """渲染健康参考仪表板"""
    import streamlit as st
    
    st.header("📊 综合健康参考")
    st.caption("基于实时数据和用户评估的综合健康分析")
    
    # 获取综合健康报告
    res = requests.post(f"{FLASK_BASE_URL}/health/report", json={"user_id": "anonymous"})
    report = res.json()

    
    # 显示健康评分
    col1, col2, col3 = st.columns(3)
    
    with col1:
        score = report["health_score"]["score"]
        level = report["health_score"]["level"]
        color = report["health_score"]["color"]
        
        st.metric(
            label="健康评分",
            value=f"{score}/100",
            delta=f"{level}"
        )
    
    with col2:
        realtime_status = "活跃" if report["data_sources"]["realtime_active"] else "未连接"
        st.metric(
            label="实时监测",
            value=realtime_status
        )
    
    with col3:
        user_data_status = "已录入" if report["data_sources"]["has_user_data"] else "未录入"
        st.metric(
            label="用户数据",
            value=user_data_status
        )
    
    # 健康建议
    if report["health_score"]["recommendations"]:
        st.subheader("🎯 个性化建议")
        for i, rec in enumerate(report["health_score"]["recommendations"], 1):
            st.info(f"{i}. {rec}")
    
    # 实时数据详情
    if report["realtime_data"]:
        st.subheader("📈 实时生命体征")
        realtime = report["realtime_data"]
        
        cols = st.columns(4)
        metrics = [
            ("心率", realtime.get("heart_rate", {}).get("value", "--"), "bpm"),
            ("血氧", realtime.get("blood_oxygen", {}).get("value", "--"), "%"),
            ("体温", realtime.get("temperature", {}).get("value", "--"), "°C"),
            ("血压", realtime.get("blood_pressure", {}).get("value", "--"), "mmHg")
        ]
        
        for i, (name, value, unit) in enumerate(metrics):
            with cols[i]:
                st.metric(label=f"{name} ({unit})", value=value)
    
    # 保存报告按钮
    if st.button("保存当前健康报告"):
        res=requests.post(f"{FLASK_BASE_URL}/health/save", json={"user_id": "anonymous"})
        filepath = res.json()
        st.success(f"健康报告已保存: {filepath}")
    
    # 健康趋势
    res = requests.get(f"{FLASK_BASE_URL}/health/trends", params={"user_id": "anonymous", "days": 7})
    trends = res.json()
    if trends["trends"]:
        st.subheader("📊 健康趋势")
        
        import pandas as pd
        df = pd.DataFrame(trends["trends"])
        
        # 显示趋势图
        st.line_chart(df.set_index('date')['score'], use_container_width=True)
        
        # 显示趋势总结
        st.caption(trends["summary"])


def render_realtime_dashboard():
    st.header("🩺 实时健康监测")

    # 用 session_state 保存刷新状态
    if "auto_refresh" not in st.session_state:
        st.session_state.auto_refresh = False

    # 控制面板
    col1, col2, col3 = st.columns([1, 1, 2])

    with col1:
        if st.button("开始监测", key="start_monitor"):
            res = requests.post(f"{FLASK_BASE_URL}/start")
            if res.status_code == 200:
                st.session_state.auto_refresh = True  # 开启刷新
                st.success("实时监测已启动")

    with col2:
        if st.button("停止监测", key="stop_monitor"):
            res = requests.post(f"{FLASK_BASE_URL}/stop")
            if res.status_code == 200:
                st.session_state.auto_refresh = False  # 停止刷新
                st.info("实时监测已停止")

    with col3:
        st.info("💡 提示：点击开始监测后，页面会每2秒自动刷新一次")

    # ✅ 根据状态决定是否刷新
    if st.session_state.auto_refresh:
        st_autorefresh(interval=2000, key="data_refresh")

    # 获取实时数据
    try:
        res = requests.get(f"{FLASK_BASE_URL}/data")
        display_data = res.json()
    except Exception:
        display_data = {"current": {}, "summary": {}, "history": []}

    try:
        res = requests.get(f"{FLASK_BASE_URL}/summary")
        vital_signs = res.json()
    except Exception:
        vital_signs = {}

    # 显示整体状态
    status_color = {
        "正常": "🟢",
        "警告": "🟡",
        "危险": "🔴",
        "设备未连接": "⚪"
    }

    st.subheader(
        f"{status_color.get(vital_signs.get('overall_status', '设备未连接'), '⚪')} "
        f"当前状态: {vital_signs.get('overall_status', '设备未连接')}"
    )

    # 生命体征卡片
    cols = st.columns(4)
    metrics = [
        ("心率", vital_signs.get("heart_rate")),
        ("血氧", vital_signs.get("blood_oxygen")),
        ("体温", vital_signs.get("temperature")),
        ("血压", vital_signs.get("blood_pressure")),
    ]

    for i, (name, data) in enumerate(metrics):
        if data:
            with cols[i]:
                st.metric(
                    label=f"{name} ({data['unit']})",
                    value=data["value"],
                )
                st.caption(f"正常范围: {data['range']}")

    # 警报显示
    if vital_signs.get("alerts"):
        st.subheader("⚠️ 健康警报")
        for alert in vital_signs["alerts"]:
            st.warning(alert)

    # 实时数据表格
    if display_data.get("current"):
        st.subheader("📊 实时数据详情")
        current = display_data["current"]

        col1, col2 = st.columns(2)
        with col1:
            st.write("**生理指标:**")
            st.write(f"- 心率: {current.get('heart_rate', '--')} bpm")
            st.write(f"- 血氧饱和度: {current.get('blood_oxygen', '--')}%")
            st.write(f"- 体温: {current.get('temperature', '--')}°C")

        with col2:
            st.write("**血压指标:**")
            st.write(f"- 收缩压: {current.get('systolic_bp', '--')} mmHg")
            st.write(f"- 舒张压: {current.get('diastolic_bp', '--')} mmHg")
            st.write(f"- 更新时间: {current.get('timestamp', '--')[:19]}")

    # 数据趋势图表
    if display_data.get("history") and len(display_data["history"]) > 1:
        st.subheader("📈 数据趋势")

        df = pd.DataFrame(display_data["history"])
        df["timestamp"] = pd.to_datetime(df["timestamp"])

        st.line_chart(df.set_index("timestamp")["heart_rate"], use_container_width=True)
        st.line_chart(df.set_index("timestamp")["blood_oxygen"], use_container_width=True)
        st.line_chart(df.set_index("timestamp")["temperature"], use_container_width=True)



# 创建统一的个人信息表单
def render_unified_form():
    st.subheader("个人健康信息表单")
    st.caption("请填写以下信息，系统将为您生成全面的健康风险评估")
    
    # 基本信息
    with st.expander("基本信息", expanded=True):
        col1, col2 = st.columns(2)
        with col1:
            name = st.text_input("姓名", placeholder="请输入您的姓名")
            age = st.number_input("年龄 (岁)", min_value=1, max_value=120, value=30, step=1)
            gender = st.selectbox("性别", options=["男", "女"], index=0)
        with col2:
            height = st.number_input("身高 (cm)", min_value=100, max_value=250, value=170, step=1)
            weight = st.number_input("体重 (kg)", min_value=30, max_value=200, value=65, step=1)
            
    # 健康信息
    with st.expander("健康相关信息", expanded=True):
        col1, col2 = st.columns(2)
        with col1:
            blood_pressure = st.number_input("舒张压 (mmHg)", min_value=30, max_value=140, value=70, step=1)
            is_diabetic = st.selectbox("是否患有糖尿病", options=["否", "是"], index=0)
            is_smoker = st.selectbox("是否吸烟", options=["否", "是"], index=0)
        with col2:
            pregnancies = st.number_input("怀孕次数 (次)", min_value=0, max_value=20, value=0, step=1, 
                                         help="女性填写，男性请保持0")
            has_anaemia = st.selectbox("是否有贫血", options=["否", "是"], index=0)
            has_high_bp = st.selectbox("是否有高血压", options=["否", "是"], index=0)
    
    # 计算BMI
    bmi = round(weight / (height/100)** 2, 1)
    st.info(f"计算得到的BMI: {bmi} (BMI=体重(kg)/身高(m)²)")
    
    # 准备预测数据
    diabetes_input = [
        blood_pressure, 
        age, 
        bmi, 
        pregnancies if gender == "女" else 0
    ]
    
    heart_input = [
        age, 
        1 if has_anaemia == "是" else 0, 
        1 if is_diabetic == "是" else 0, 
        1 if has_high_bp == "是" else 0, 
        1 if gender == "男" else 0, 
        1 if is_smoker == "是" else 0
    ]
    
    # 统一的数据结构
    form_data = {
        "姓名": name if name else "匿名用户",
        "年龄": age,
        "性别": gender,
        "身高": height,
        "体重": weight,
        "BMI": bmi,
        "舒张压": blood_pressure,
        "怀孕次数": pregnancies if gender == "女" else "不适用",
        "糖尿病史": is_diabetic,
        "吸烟史": is_smoker,
        "贫血情况": has_anaemia,
        "高血压情况": has_high_bp
    }
    
    # 保存BMI到会话状态，供可视化使用
    st.session_state['user_bmi'] = bmi
    
    if st.button("生成健康评估报告", type="primary", use_container_width=True):
        try:
        # 1) 调后端：糖尿病预测
            res = requests.post(f"{FLASK_BASE_URL}/diabetes",
            json={
                "BloodPressure": diabetes_input[0],
                "Age": diabetes_input[1],
                "BMI": diabetes_input[2],
                "Pregnancies": diabetes_input[3]
            })
            res.raise_for_status()
            diabetes_result = res.json()

        # 2) 调后端：心衰预测
            res = requests.post(f"{FLASK_BASE_URL}/heart/predict",
            json={
        "Age": heart_input[0],
        "Anaemia": heart_input[1],
        "Diabetes": heart_input[2],
        "HighBP": heart_input[3],
        "Sex": heart_input[4],
        "Smoker": heart_input[5]
        })
            res.raise_for_status()
            heart_result = res.json()

        # 3) 组装预测结果（用于展示 & 保存）
            predictions = {
            "糖尿病风险评估": {
                "prediction": diabetes_result["prediction"],
                "probability": diabetes_result["probability"]
            },
            "心衰风险评估": {
                "prediction": heart_result["prediction"],
                "probability": heart_result["probability"]
            }
        }

        # 4) 改为调用后端“保存”接口（不要在前端写文件了）
            save_res = requests.post(f"{FLASK_BASE_URL}/user/save",
            json={
                "user_id": st.session_state.get("user_id", "anonymous"),
                "form_data": form_data,
                "predictions": predictions
            })
            save_res.raise_for_status()
            saved = save_res.json()
            save_path = saved.get("path")

        # 5) 展示结果（你原来的方法）
            show_prediction_results(form_data, predictions, save_path)

        except requests.RequestException as e:
            st.error(f"后端接口请求失败：{e}")
        except Exception as e:
            st.error(f"生成评估报告时出现错误：{e}")





# 显示预测结果页面
def show_prediction_results(form_data, predictions, save_path=None):
    st.subheader("健康风险评估报告")
    
    # 显示用户信息卡片
    with st.expander("个人信息摘要", expanded=True):
        st.write("您的基本健康信息如下：")
        for key, value in form_data.items():
            st.write(f"**{key}**: {value}")
    
    # 显示所有预测结果
    for disease, result in predictions.items():
        with st.expander(f"{disease}", expanded=True):
            risk_level = "高风险" if result['prediction'] == 1 else "低风险"
            color = "#f87171" if result['prediction'] == 1 else "#34d399"
            
            # 显示风险等级
            st.markdown(
                f"<div style='color:{color}; font-size:20px; font-weight:bold;'>评估结果: {risk_level}</div>", 
                unsafe_allow_html=True
            )
            
            # 显示概率
            prob_text = (
                "".join(map(str, result['probability']))
                if isinstance(result['probability'], list)
                else str(result['probability'])
            )
            st.write(f"预测概率: {prob_text}")
            
            try:
                res = requests.post(
                    f"{FLASK_BASE_URL}/health_prompt",
                    json={
                        "task_name": disease,
                        "inputs": form_data,
                        "prediction": result['prediction'],
                        "probability": result['probability'],
                    },
                    timeout=10
                )
                res.raise_for_status()
                prompt = res.json().get("prompt", "")
            except Exception as e:
                prompt = f"生成提示词失败: {e}"
            
            # Step 2: 调用 /deepseek_call 获取健康建议
            try:
                res = requests.post(
                    f"{FLASK_BASE_URL}/deepseek_call",
                    json={"prompt": prompt},
                    timeout=20
                )
                res.raise_for_status()
                advice = res.json().get("result", "未获取到健康建议")
            except Exception as e:
                advice = f"健康建议服务调用失败: {e}"
            
            # 显示健康建议
            st.markdown("**健康建议：**")
            st.write(advice)
    
    # 显示保存信息
    if save_path:
        st.success(f"您的健康评估报告已保存至: {save_path}")
    
    # 添加操作按钮
    col1, col2 = st.columns(2)
    with col1:
        if st.button("重新填写信息", use_container_width=True):
            st.rerun()
    with col2:
        if st.button("查看历史记录", use_container_width=True):
            st.session_state['active_tab'] = 'history'
            st.rerun()

# 历史记录查看功能
def render_history():
    st.subheader("历史评估记录")

    # 1. 调用后端接口获取文件列表
    try:
        res = requests.get(f"{FLASK_BASE_URL}/list_users", timeout=10)
        res.raise_for_status()
        saved_files = res.json()   # 后端返回的就是一个文件名列表
    except Exception as e:
        st.error(f"获取历史记录失败: {e}")
        return

    # 2. 判断是否有历史记录
    if not saved_files:
        st.info("暂无历史评估记录")
        return

    # 3. 用户选择查看某个记录
    selected_file = st.selectbox(
        "选择要查看的评估记录",
        saved_files,
        format_func=lambda x: f"{x.split('_')[1]} - {x.split('_')[2].split('.')[0]}"
    )
    if selected_file:
    # === 调用后端接口加载数据 ===
        try:
            res = requests.post(f"{FLASK_BASE_URL}/user/load",
            json={"filename": selected_file},
            timeout=10)
            res.raise_for_status()
            resp_json = res.json()
            if resp_json.get("message") == "加载成功":
                user_data = resp_json.get("data", {})
            else:
                st.error(resp_json.get("message", "加载失败"))
                user_data = None
        except Exception as e:
            st.error(f"加载记录失败: {e}")
            user_data = None

    # === 显示用户数据 ===
    if user_data:
        with st.expander("评估记录详情", expanded=True):
            st.write(f"**评估时间**: {datetime.fromisoformat(user_data['timestamp']).strftime('%Y-%m-%d %H:%M:%S')}")
            st.write(f"**用户ID**: {user_data['user_id']}")

            # 显示表单数据
            st.markdown("### 个人信息")
            for key, value in user_data['form_data'].items():
                st.write(f"**{key}**: {value}")

            # 显示预测结果
            st.markdown("### 预测结果")
            for disease, result in user_data['predictions'].items():
                risk_level = "高风险" if result['prediction'] == 1 else "低风险"
                color = "#f87171" if result['prediction'] == 1 else "#34d399"

                st.markdown(f"#### {disease}")
                st.markdown(
                    f"<div style='color:{color}; font-size:16px; font-weight:bold;'>评估结果: {risk_level}</div>",
                    unsafe_allow_html=True
                )

                prob_text = "".join(map(str, result['probability'])) if isinstance(result['probability'], list) else str(result['probability'])
                st.write(f"预测概率: {prob_text}")

        # 添加删除按钮
        col1, col2 = st.columns(2)
        with col1:
            if st.button("删除此记录", use_container_width=True, type="secondary"):
                try:
                    res = requests.post(f"{FLASK_BASE_URL}/user/delete",
                        json={"filename": selected_file},timeout=10)
                    if res.status_code == 200:
                        st.success(f"记录 {selected_file} 已删除")
                        st.rerun()
                    else:
                        st.error(res.json().get("message", "删除失败"))
                except Exception as e:
                    st.error(f"删除请求失败: {e}")

        with col2:
            if st.button("返回评估", use_container_width=True):
                st.session_state['active_tab'] = 'assessment'
                st.rerun()

def render_visualization():
    st.subheader("身体数据可视化")
    st.caption("查看您的健康数据分布和风险因素关联")

    # BMI分类可视化
    st.markdown("### BMI 分类参考")
    bmi_data = {
        '偏瘦': [10, 18.4],
        '正常': [18.5, 23.9],
        '超重': [24, 27.9],
        '肥胖': [28, 60]
    }

    # 从会话状态获取用户的BMI（如果有）
    user_bmi = st.session_state.get('user_bmi', 24.0)

    # 绘制BMI范围图
    import plotly.graph_objects as go
    fig = go.Figure()

    # 添加BMI范围
    for category, range_vals in bmi_data.items():
        color = 'green' if category == '正常' else 'yellow' if category == '超重' else 'red' if category == '肥胖' else 'blue'
        fig.add_trace(go.Scatter(
            x=[range_vals[0], range_vals[1]],
            y=[1, 1],
            mode='lines',
            line=dict(width=20, color=color),
            name=category
        ))

    # 添加用户BMI标记
    fig.add_trace(go.Scatter(
        x=[user_bmi],
        y=[1],
        mode='markers',
        marker=dict(size=15, color='purple', symbol='star'),
        name='您的BMI'
    ))

    fig.update_layout(
        title='BMI分类区间',
        xaxis_title='BMI值',
        yaxis=dict(showticklabels=False, showgrid=False),
        height=200,
        showlegend=True
    )
    st.plotly_chart(fig)

    # 健康风险因素相关性
    st.markdown("### 健康风险因素相关性")
    try:
        import pandas as pd
        import seaborn as sns
        import matplotlib.pyplot as plt

        # 加载示例数据 - 使用相对路径以支持打包移植
        import os
        try:
            # 尝试从当前目录加载
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_path = os.path.join(current_dir, '..', 'data', 'diabetes_reduced.csv')
            diabetes_data = pd.read_csv(data_path)
        except:
            try:
                # 如果失败，尝试从打包后的相对路径加载
                data_path = os.path.join('data', 'diabetes_reduced.csv')
                diabetes_data = pd.read_csv(data_path)
            except:
                # 如果都失败，使用示例数据
                st.warning("无法加载数据文件，使用示例数据")
                # 创建示例数据
                import numpy as np
                np.random.seed(42)
                sample_size = 100
                diabetes_data = pd.DataFrame({
                    'BloodPressure': np.random.normal(70, 10, sample_size),
                    'Age': np.random.randint(20, 80, sample_size),
                    'BMI': np.random.normal(25, 5, sample_size),
                    'Pregnancies': np.random.randint(0, 10, sample_size)
                })
        corr = diabetes_data.corr()

        # 绘制相关性热图
        plt.figure(figsize=(10, 8))
        sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f")
        plt.title('糖尿病风险因素相关性')
        st.pyplot(plt)
    except Exception as e:
        st.warning(f"无法加载数据或绘制图表: {e}")


def render_realtime_monitoring():
    """渲染实时健康监测页面"""
    render_realtime_dashboard()

def render_health_reference_page():
    """渲染健康参考页面"""
    render_health_reference_dashboard()

def main():
    st.set_page_config(page_title="健康风险预测与建议", page_icon="🩺", layout="centered")
    
    # 初始化登录状态
    if "authenticated" not in st.session_state:
        st.session_state.authenticated = False
    if "username" not in st.session_state:
        st.session_state.username = None

    # === 登录拦截逻辑 ===
    if not st.session_state.authenticated:
        render_login_page()
        st.stop()   # 🚫 阻止下面的主界面加载
    
    
    st.title("🩺 健康风险预测与管理系统")
    st.caption("使用已训练模型进行预测，提供个性化健康建议并管理您的健康评估记录。")

    # 初始化会话状态
    if 'active_tab' not in st.session_state:
        st.session_state['active_tab'] = 'assessment'

    tab1, tab2, tab3, tab4, tab5 = st.tabs(["健康评估", "历史记录", "数据可视化", "实时监测", "健康参考"])
    with tab1:
        st.session_state['active_tab'] = 'assessment'
        render_unified_form()
    with tab2:
        st.session_state['active_tab'] = 'history'
        render_history()
    with tab3:
        st.session_state['active_tab'] = 'visualization'
        render_visualization()
    with tab4:
        st.session_state['active_tab'] = 'realtime'
        render_realtime_monitoring()
    with tab5:
        st.session_state['active_tab'] = 'reference'
        render_health_reference_page()

    st.markdown("---")
    st.caption(
        "免责声明：本应用仅用于教育与参考，不构成医疗诊断或治疗建议。如有不适，请及时到正规医疗机构就诊。"
    )


if __name__ == "__main__":
    main()
