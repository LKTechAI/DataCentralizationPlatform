from .base_data import BaseData

class SalesData(BaseData):
    """
    Inherits BaseData.
    Overrides process() with sales-specific behavior.
    """

    def __init__(self, source: str, region: str):
        super().__init__(source)
        self.region = region

    def process(self):
        cleaned = self.clean()
        # sample computation: sum / summary (fake)
        summary = f"Sales summary for {self.region}: total_orders=123"
        return {
            "type": "sales",
            "region": self.region,
            "cleaned": cleaned,
            "summary": summary
        }
