from abc import ABC, abstractmethod

class BaseData(ABC):

    def __init__(self, source: str):
        # Encapsulated attributes
        self._source = source   # protected attribute (by convention)
        self._raw = None

    def load(self, data):
        """Load/attach raw data to instance."""
        self._raw = data
        return f"Loaded data: {str(data)[:80]}"

    def clean(self):
        """Generic cleaning - can be overridden."""
        if self._raw is None:
            return "No data to clean"
        # simple cleaning demonstration
        cleaned = str(self._raw).strip()
        return f"Cleaned: {cleaned}"

    @abstractmethod
    def process(self):
        """Force child classes to implement processing logic."""
        pass
