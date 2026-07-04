# XML Parsing in FastAPI

When working with external APIs like the [[FotMobAPI]] that return `text/xml` or `application/xml` instead of JSON, the `apps/telemetry` FastAPI backend must handle XML parsing.

## Pattern

To keep the backend lightweight and avoid dependency conflicts with heavy parsers like `lxml` or `beautifulsoup4`, we use the built-in Python `xml.etree.ElementTree`.

```python
import xml.etree.ElementTree as ET

# Inside your proxy endpoint
if content_type and "xml" in content_type:
    root = ET.fromstring(response.text)
    # Recursively parse elements to dict
```

## Defensive Parsing
Because some APIs (like FotMob) might mix JSON and XML depending on the endpoint or cache hit status, we implement a fallback mechanism based on the `Content-Type` header:
- If `xml` in header -> `parse_match_xml`
- If `json` in header -> `parse_match_json`

This prevents the backend from crashing when an API's internal structure changes.
