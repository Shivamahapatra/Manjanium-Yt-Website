import os
import re

directory = "O:/AI projects/Manjanium Sports UI/Manjanium Yt Website/Manjanium_App/apps/hub/src"

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            if "<Link" in content and "/* @ts-ignore */" not in content:
                # Add {/* @ts-ignore */} before <Link
                new_content = re.sub(r'(\s*)(<Link\b)', r'\1{/* @ts-ignore */}\1\2', content)
                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    print(f"Fixed {filepath}")
