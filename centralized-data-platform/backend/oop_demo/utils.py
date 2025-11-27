from .manufacturing_data import ManufacturingData
from .sales_data import SalesData
from .testing_data import TestingData
from .field_data import FieldData
from typing import List

def instantiate_for_type(t: str, source: str, meta: dict):
    """
    Factory-ish helper to pick and return the right object.
    Demonstrates Polymorphism usage: the returned object implements process().
    """
    if t == "manufacturing":
        return ManufacturingData(source=source, machine_id=meta.get("machine_id", "UNKNOWN"))
    if t == "sales":
        return SalesData(source=source, region=meta.get("region", "GLOBAL"))
    if t == "testing":
        return TestingData(source=source, test_suite=meta.get("test_suite", "DEFAULT"))
    if t == "field":
        return FieldData(source=source, location=meta.get("location", "UNKNOWN"))
    raise ValueError("Unknown type")

def process_all(instances: List):
    """
    Accepts a list of BaseData subclass instances and calls process() on each.
    Shows runtime polymorphism: same call -> different behaviors.
    """
    results = []
    for inst in instances:
        results.append(inst.process())
    return results
