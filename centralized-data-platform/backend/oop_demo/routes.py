from flask import Blueprint, request, jsonify
from .utils import instantiate_for_type, process_all

oop_bp = Blueprint("oop_demo", __name__)

@oop_bp.route("/demo/process", methods=["POST"])
def demo_process_single():
    """
    Example endpoint:
    POST body: {"type":"manufacturing","source":"Factory_DB", "meta": {"machine_id":"MC-110"}, "data":" raw payload ..."}
    """
    body = request.get_json() or {}
    t = body.get("type")
    source = body.get("source", "DemoSource")
    meta = body.get("meta", {})
    data = body.get("data", "")

    obj = instantiate_for_type(t, source, meta)
    obj.load(data)
    result = obj.process()
    return jsonify(result)

@oop_bp.route("/demo/process-batch", methods=["POST"])
def demo_process_batch():
    """
    POST body:
    {
      "items": [
        {"type":"manufacturing","source":"A","meta":{"machine_id":"MC1"},"data":"..."},
        {"type":"sales","source":"B","meta":{"region":"India-West"},"data":"..."},
        ...
      ]
    }
    Returns the processed results for each item (demonstrates polymorphism)
    """
    body = request.get_json() or {}
    items = body.get("items", [])
    instances = []
    for it in items:
        t = it.get("type")
        source = it.get("source", "DemoSource")
        meta = it.get("meta", {})
        data = it.get("data", "")
        obj = instantiate_for_type(t, source, meta)
        obj.load(data)
        instances.append(obj)

    results = process_all(instances)
    return jsonify({"results": results})
