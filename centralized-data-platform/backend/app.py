from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from utils.data_cleaning import clean_row
from utils.analysis import summarize
import pandas as pd
import numpy as np
from datetime import datetime
from oop_demo.routes import oop_bp
import os


app = Flask(__name__)
CORS(app)
app.register_blueprint(oop_bp, url_prefix="/oop_demo")

# --- FIREBASE INITIALIZATION ---

cred = credentials.Certificate({
    "type": os.environ.get("FIREBASE_TYPE"),
    "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
    "private_key_id": os.environ.get("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.environ.get("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.environ.get("FIREBASE_CLIENT_ID"),
    "auth_uri": os.environ.get("FIREBASE_AUTH_URI"),
    "token_uri": os.environ.get("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.environ.get("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.environ.get("FIREBASE_CLIENT_CERT_URL")
})

firebase_admin.initialize_app(cred)
db = firestore.client()

# Home route
@app.route("/")
def home():
    return jsonify({"message": "Backend running..."})

# --- Upload Manufacturing Data ---
@app.route("/upload/manufacturing", methods=["POST"])
def upload_manufacturing():
    data = request.json
    clean = clean_row(data)
    db.collection("manufacturing").add(clean)
    return jsonify({"status": "success", "message": "Manufacturing data uploaded."})


# --- Upload Sales Data ---
@app.route("/upload/sales", methods=["POST"])
def upload_sales():
    data = request.json
    clean = clean_row(data)
    db.collection("sales").add(clean)
    return jsonify({"status": "success", "message": "Sales data uploaded."})

# --- Upload Field Data ---
@app.route("/upload/field", methods=["POST"])
def upload_field():
    data = request.json
    clean = clean_row(data)
    db.collection("field").add(clean)
    return jsonify({"status": "success", "message": "Field data uploaded."})

# --- Upload Testing Data ---
@app.route("/upload/testing", methods=["POST"])
def upload_testing():
    data = request.json
    clean = clean_row(data)
    db.collection("testing").add(clean)
    return jsonify({"status": "success", "message": "Testing data uploaded."})

# --- Get Manufacturing Data ---
@app.route("/manufacturing", methods=["GET"])
def get_manufacturing():
    docs = db.collection("manufacturing").stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(data)

# --- GET endpoints for each (optional) ---
@app.route("/sales", methods=["GET"])
def get_sales():
    docs = db.collection("sales").stream()
    return jsonify([doc.to_dict() for doc in docs])

@app.route("/field", methods=["GET"])
def get_field():
    docs = db.collection("field").stream()
    return jsonify([doc.to_dict() for doc in docs])

@app.route("/testing", methods=["GET"])
def get_testing():
    docs = db.collection("testing").stream()
    return jsonify([doc.to_dict() for doc in docs])

# @app.route("/analysis/manufacturing", methods=["GET"])
# def analyze_manufacturing():
#     docs = db.collection("manufacturing").stream()
#     data = [doc.to_dict() for doc in docs]
#     return jsonify(summarize(data))

@app.route("/analysis/sales", methods=["GET"])
def analyze_sales():
    docs = db.collection("sales").stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(summarize(data))

@app.route("/analysis/field", methods=["GET"])
def analyze_field():
    docs = db.collection("field").stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(summarize(data))

@app.route("/analysis/testing", methods=["GET"])
def analyze_testing():
    docs = db.collection("testing").stream()
    data = [doc.to_dict() for doc in docs]
    return jsonify(summarize(data))

# --- Manufacturing analysis endpoint (reads CSV directly) ---
MANUFACTURING_CSV = r"D:\document\NIT Workspace\Synapse\centralized-data-platform\synthetic_data\manufacturing.csv"

def _load_manufacturing_csv():
    """Load CSV from disk, parse dates, coerce numeric types and return DataFrame."""
    df = pd.read_csv(MANUFACTURING_CSV)
    # ensure Date column is datetime
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    # coerce numeric columns
    for c in ["Production_Count", "Defective_Count", "Downtime_Minutes"]:
        if c in df.columns:
            df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)
    # ensure Machine_ID exists
    if "Machine_ID" not in df.columns:
        df["Machine_ID"] = "Unknown"
    return df

def _conclude_production_trend(series):
    """Simple textual conclusion for production trend."""
    if len(series) < 2:
        return "Not enough data to infer trend."
    x = np.arange(len(series))
    y = np.array(series, dtype=float)
    # slope of linear fit
    a, b = np.polyfit(x, y, 1)
    pct_change = (y[-1] - y[0]) / (y[0] + 1e-9)
    if a > 0 and pct_change > 0.02:
        return f"Production increased by {pct_change*100:.1f}% over the selected period."
    if a < 0 and pct_change < -0.02:
        return f"Production decreased by {abs(pct_change)*100:.1f}% — investigate process changes."
    return "Production stable over the selected period."

@app.route("/analysis/manufacturing", methods=["GET"])
def analysis_manufacturing():
    try:
        df = _load_manufacturing_csv()
    except Exception as e:
        return jsonify({"error": "Failed to load CSV", "details": str(e)}), 500

    # ---- DATE FILTERING ----
    start = request.args.get("start")
    end = request.args.get("end")

    if start:
        df = df[df["Date"] >= pd.to_datetime(start)]
    if end:
        df = df[df["Date"] <= pd.to_datetime(end)]

    # If no filter → default = most recent 10 days
    if not start and not end:
        df = df.sort_values("Date")
        last_dates = df["Date"].dt.date.unique()[-10:]  # last 10 unique days
        df = df[df["Date"].dt.date.isin(last_dates)]

    # ---------------- KPIs ----------------
    total_production = int(df["Production_Count"].sum())
    total_defects = int(df["Defective_Count"].sum())
    defect_rate = 100.0 * total_defects / (total_production + 1e-9)
    avg_downtime = float(df["Downtime_Minutes"].mean())

    # ---------------- TIME SERIES ----------------
    ts = df.groupby(df["Date"].dt.date).agg({
        "Production_Count": "sum",
        "Defective_Count": "sum",
        "Downtime_Minutes": "sum"
    }).reset_index()

    ts = ts.sort_values("Date")
    dates = ts["Date"].astype(str).tolist()
    production_ts = ts["Production_Count"].astype(int).tolist()
    defects_ts = ts["Defective_Count"].astype(int).tolist()

    # ---------------- MACHINE SUMMARY ----------------
    by_machine = []
    machine_agg = df.groupby("Machine_ID").agg({
        "Production_Count": "sum",
        "Defective_Count": "sum",
        "Downtime_Minutes": "sum"
    }).reset_index()

    for _, r in machine_agg.iterrows():
        prod = int(r["Production_Count"])
        defects = int(r["Defective_Count"])
        downtime = float(r["Downtime_Minutes"])
        defect_rate_m = 100.0 * defects / (prod + 1e-9)

        by_machine.append({
            "machine": r["Machine_ID"],
            "production_sum": prod,
            "defects_sum": defects,
            "defect_rate_pct": round(defect_rate_m, 2),
            "total_downtime": round(downtime, 1)
        })

    # -------------- Downtime by Machine --------------
    downtime_by_machine = sorted(
        [{"machine": m, "total_downtime": float(v)} for m, v in df.groupby("Machine_ID")["Downtime_Minutes"].sum().items()],
        key=lambda x: x["total_downtime"], 
        reverse=True
    )

    # ----------------- Sample (Recent 10 days only) -----------------
    sample = df.sort_values("Date").tail(100)  # keep more, then reduce
    sample = sample.groupby(sample["Date"].dt.date).head(5)  # 5 rows per day
    sample = sample.to_dict(orient="records")

    # ------------------ Conclusions ------------------
    conclusions = [
        f"Total production: {total_production}, defects: {total_defects} (rate {defect_rate:.2f}%)."
    ]

    def _trend(series):
        if len(series) < 2:
            return "Not enough data to infer trend."
        pct_change = (series[-1] - series[0]) / (series[0] + 1e-9)
        if pct_change > 0.02:
            return f"Production increased by {pct_change*100:.1f}%."
        if pct_change < -0.02:
            return f"Production decreased by {abs(pct_change)*100:.1f}%."
        return "Production stable."
    conclusions.append(_trend(production_ts))

    result = {
        "kpis": {
            "total_production": total_production,
            "total_defects": total_defects,
            "defect_rate_pct": round(defect_rate, 2),
            "avg_downtime_minutes": round(avg_downtime, 2)
        },
        "time_series": {
            "dates": dates,
            "production": production_ts,
            "defects": defects_ts
        },
        "by_machine": by_machine,
        "downtime_by_machine": downtime_by_machine,
        "conclusions": conclusions,
        "sample": sample
    }

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)


