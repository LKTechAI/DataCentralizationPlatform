from .base_data import BaseData

class TestingData(BaseData):
    """
    Inherits BaseData.
    Overrides process() with testing-specific behavior.
    """

    def __init__(self, source: str, test_suite: str):
        super().__init__(source)
        self.test_suite = test_suite

    def process(self):
        cleaned = self.clean()
        result = f"Testing results for {self.test_suite}: PASS"
        return {
            "type": "testing",
            "test_suite": self.test_suite,
            "cleaned": cleaned,
            "result": result
        }
