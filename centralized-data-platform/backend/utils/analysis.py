import pandas as pd

def summarize(data_list):
    df = pd.DataFrame(data_list)

    summary = {
        "total_rows": len(df),
        "columns": list(df.columns),
        "missing_values": df.isnull().sum().to_dict(),
    }

    # Numeric stats
    numeric_cols = df.select_dtypes(include=['int', 'float'])
    if not numeric_cols.empty:
        summary["numeric_summary"] = numeric_cols.describe().to_dict()

    return summary
