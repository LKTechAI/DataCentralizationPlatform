from .base_data import BaseData

class ManufacturingData(BaseData):
    """
    Inherits from BaseData.
    """
    def __init__(self, source: str, machine_id: str):
        super().__init__(source)
        self.machine_id = machine_id

    def process(self):
        """
        Overrides process() with manufacturing-specific behavior.
        """
        cleaned = self.clean()
        analysis = f"Manufacturing analysis for {self.machine_id}: OK"
        return {
            "type": "manufacturing",
            "machine_id": self.machine_id,
            "cleaned": cleaned,
            "analysis": analysis
        }
