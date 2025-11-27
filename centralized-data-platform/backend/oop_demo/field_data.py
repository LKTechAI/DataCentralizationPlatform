from .base_data import BaseData

class FieldData(BaseData):
    """
    Field data (e.g., on-site sensor / farmer-uploaded data)
    """

    def __init__(self, source: str, location: str):
        super().__init__(source)
        self.location = location

    def process(self):
        cleaned = self.clean()
        # example: geotag + quick inference (fake)
        inference = f"Field inference at {self.location}: No anomaly"
        return {
            "type": "field",
            "location": self.location,
            "cleaned": cleaned,
            "inference": inference
        }
