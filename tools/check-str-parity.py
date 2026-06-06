#!/usr/bin/env python3
"""Fail if Mini App STR.ru and STR.en key sets differ (EN-missing key -> undefined/white-screen)."""
import re, sys
f = sys.argv[1] if len(sys.argv) > 1 else "phase-a/webapp/dist/app.jsx"
s = open(f, encoding="utf-8").read()
def block(key):
    m = re.search(r'\n  ' + key + r'\s*:\s*\{', s)
    b = s.index('{', m.start()); d = 0; j = b
    while j < len(s):
        if s[j] == '{': d += 1
        elif s[j] == '}':
            d -= 1
            if d == 0: break
        j += 1
    body = s[b+1:j]
    body = re.sub(r'"(?:[^"\\]|\\.)*"', '""', body)   # strip string values
    return set(re.findall(r'([A-Za-z_]\w*)\s*:', body))
ru, en = block("ru"), block("en")
miss_en, miss_ru = sorted(ru - en), sorted(en - ru)
if miss_en or miss_ru:
    print("STR parity FAIL — in ru not en:", miss_en, "| in en not ru:", miss_ru); sys.exit(1)
print(f"STR parity OK ({len(ru)} keys each)"); sys.exit(0)
