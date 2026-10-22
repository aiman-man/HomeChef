import json
import os
import requests
import argostranslate.package
import argostranslate.translate

EN_PATH = os.path.join("src", "locales", "en.json")
MS_PATH = os.path.join("src", "locales", "ms.json")

def translate_argos(text):
    try:
        return argostranslate.translate.translate(text, "en", "ms")
    except Exception:
        return None

def translate_libre(text):
    try:
        response = requests.post(
            "http://localhost:5000/translate",
            json={"q": text, "source": "en", "target": "ms", "format": "text"},
            timeout=5
        )
        if response.status_code == 200:
            return response.json().get("translatedText")
    except Exception:
        return None
    return None

def main():
    if not os.path.exists(EN_PATH):
        print("Fail en.json tidak dijumpai! Sila jalankan extract.js dahulu.")
        return

    # Muat turun pakej en->ms Argos Translate jika belum ada
    print("Menyemak pakej Argos Translate...")
    try:
        argostranslate.package.update_package_index()
        available_packages = argostranslate.package.get_available_packages()
        package_to_install = next(
            (p for p in available_packages if p.from_code == "en" and p.to_code == "ms"), None
        )
        if package_to_install:
            argostranslate.package.install_from_path(package_to_install.download())
            print("Pakej en->ms Argos Translate berjaya dipasang.")
    except Exception as e:
        print(f"Nota Argos Translate: {e}")

    with open(EN_PATH, "r", encoding="utf-8") as f:
        en_data = json.load(f)

    ms_data = {}
    print(f"Menterjemah {len(en_data)} kunci...")

    for key, text in en_data.items():
        translated = translate_argos(text)
        if not translated:
            translated = translate_libre(text)
        
        # Fallback kepada teks asal jika kedua-duanya gagal
        ms_data[key] = translated if translated else text

    with open(MS_PATH, "w", encoding="utf-8") as f:
        json.dump(ms_data, f, ensure_ascii=False, indent=2)

    print(f"Penterjemahan selesai! Fail ms.json disimpan di: {MS_PATH}")

if __name__ == "__main__":
    main()