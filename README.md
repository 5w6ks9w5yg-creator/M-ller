# Müller – Flaschnerei & Sanitärinstallation

Website für Müller Flaschnerei und Sanitärinstallationen, Schillerstraße 18, 70839 Gerlingen.

Statische One-Page-Website: reines HTML, CSS und JavaScript, ohne Build-Schritt und ohne Abhängigkeiten.

## Struktur

Alle Dateien liegen direkt im Hauptordner (keine Unterordner) – so kann man sie einfach per Drag & Drop bei GitHub hochladen.

## Lokal ansehen

`index.html` im Browser öffnen – oder einen kleinen Server starten:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Auf GitHub Pages veröffentlichen

1. Neues Repository auf GitHub anlegen (z. B. `flaschnerei-mueller`).
2. Dateien hochladen:
   ```bash
   git init
   git add .
   git commit -m "Website Flaschnerei Müller"
   git branch -M main
   git remote add origin https://github.com/<benutzername>/flaschnerei-mueller.git
   git push -u origin main
   ```
3. Im Repository: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)`** → Save.
4. Nach 1–2 Minuten ist die Seite unter `https://<benutzername>.github.io/flaschnerei-mueller/` erreichbar.

### Eigene Domain

Für `www.flaschnerei-mueller.com`: unter **Settings → Pages → Custom domain** die Domain eintragen (GitHub legt dann eine `CNAME`-Datei an) und beim Domain-Anbieter einen CNAME-Eintrag `www → <benutzername>.github.io` setzen.

## Inhalte anpassen

- **Texte:** direkt in `index.html`.
- **Fotos:** Dateien in dem Hauptordner durch gleichnamige ersetzen.
- **Bewertungen:** Karten im Abschnitt `#bewertungen` in `index.html` (statisch übernommen von Google Maps).
- **Farben:** CSS-Variablen am Anfang von `style.css` (`--blue`, `--red`, `--copper` …).

## Vor dem Livegang prüfen

- Die Datenschutzerklärung stammt von der alten Website und bezieht sich noch auf BDSG/TMG – sie sollte auf DSGVO aktualisiert werden (inkl. Hinweis auf Google Fonts bzw. Fonts lokal einbinden).
- Die Texte zu Sanitär und Heizung sind Platzhalter und mit dem Betrieb abzustimmen.
