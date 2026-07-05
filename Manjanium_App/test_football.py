import urllib.request
import json
try:
    r = urllib.request.urlopen("http://localhost:8000/api/football/matches?date=20260704", timeout=20)
    data = json.loads(r.read())
    print("Total matches:", data.get("total_matches"))
    if data.get("leagues"):
        print("First match:", json.dumps(data["leagues"][0]["matches"][0], indent=2))
except Exception as e:
    print(e)
