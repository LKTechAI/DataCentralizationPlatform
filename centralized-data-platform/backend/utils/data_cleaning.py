import pandas as pd

def clean_row(row_dict):
    cleaned = {}

    for key, value in row_dict.items():

        # Convert empty strings to None
        if value == "" or value is None:
            cleaned[key] = None
            continue

        # Convert numbers stored as strings
        try:
            if "." in str(value):
                cleaned[key] = float(value)
            else:
                cleaned[key] = int(value)
            continue
        except:
            pass

        # Convert date columns
        if "date" in key.lower():
            try:
                cleaned[key] = pd.to_datetime(value).strftime("%Y-%m-%d")
                continue
            except:
                pass

        cleaned[key] = value

    return cleaned
