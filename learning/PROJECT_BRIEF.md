# MediList Lab – dein Praxisprojekt

Ziel: Eine verständliche API-Dokumentation für einen **frei erfundenen Medikationslisten-Workflow** erstellen. Der fachliche Bezug zu deiner Arbeit liegt bei Herkunft, Datenständen und nachvollziehbaren Dokumentationsschritten. Dieses Projekt beschreibt keine Schnittstelle oder Funktion eines Oracle-Health-, i.s.h.med- oder ePA-Produkts.

Die technische Grundlage ist von Codex vorbereitet. Der eigene Lernanteil besteht darin, die Beispiele zu prüfen, Entscheidungen zu begründen, Texte selbst zu überarbeiten und das Ergebnis mit einem neuen Leser zu testen. Trage nur tatsächlich erledigte Arbeiten in `evidence.json` ein.

## Szenario

Eine Entwicklerin soll zwei synthetische Listen lesen: `hospital-demo` und `record-demo`. Sie muss erkennen, aus welcher Quelle ein Eintrag stammt, welche Version vorliegt und welche **exakten Demo-Codes** sich unterscheiden. Anschließend erfasst sie mit der simulierten Rolle `reviewer` einen Dokumentationsstatus. Ein ETag verhindert das unbemerkte Überschreiben eines inzwischen geänderten Review-Status. Ein Ereignisprotokoll macht die Demo-Schritte sichtbar.

Es gibt keine echten Arzneimittel, Dosierungen oder Patientendaten. Ein gemeinsamer Code sagt nichts über klinische Gleichwertigkeit aus. `documentation_complete` bestätigt ausschließlich einen Dokumentationsschritt.

## Acht Etappen

| ID | Deine Aufgabe | Nachweis |
| --- | --- | --- |
| LAB-01 | API starten; zwei Quellen und deren Eintragsherkunft erklären. | Eigene Notiz mit tatsächlicher Antwort und Erklärung von `source_record_id`. |
| LAB-02 | Quickstart in einem neuen Terminal ausführen und mindestens zwei Stolperstellen verbessern. | Commit mit Textänderungen und Begründung. |
| LAB-03 | OpenAPI in VS Code öffnen und mit der OpenAPI-Erweiterung validieren. | Datum, Validator und behobene oder verbleibende Befunde. |
| LAB-04 | Postman-Dateien importieren und alle zwölf Requests in Reihenfolge ausführen. | Tatsächliche Ergebnisse einschließlich der erwarteten Fehler. |
| LAB-05 | `source_versions` und Review-ETag unterscheiden; 428, 412 und 409 gezielt auslösen. | Eigene Erklärung, welche Aktion nach jedem Fehler sinnvoll ist. |
| LAB-06 | Mindestens drei Dokumentationsseiten substanziell in deiner Sprache überarbeiten. | Dateiliste und konkrete Vorher-nachher-Beispiele. |
| LAB-07 | Einer anderen Person den Ablauf ohne mündliche Hilfe geben. | Pseudonymes Reviewer-Label, Datum, Befunde und Korrekturen. |
| LAB-08 | Case Study und Beitragserklärung vervollständigen; Veröffentlichung prüfen. | Eigener Beitrag, KI-Unterstützung, Grenzen und abschließender Check. |

Gute Review-Fragen: Findet die Leserin die Quelle eines Eintrags? Erkennt sie, dass der Vergleich keine Therapieprüfung ist? Weiß sie nach 412, wie sie den aktuellen Status liest? Versteht sie den Unterschied zwischen `documented` und einer klinischen Freigabe?

## Einstieg

1. Unter Windows den lokalen Kursstarter `Medikationsprojekt-starten.cmd` öffnen.
2. In der Vorschau bei **Quickstart** beginnen und die Postman-Dateien importieren.
3. Änderungen in kleinen, nachvollziehbaren Git-Commits speichern.
4. [Veröffentlichung und Nachweise](PUBLISHING.md) sowie die [LinkedIn-Vorlage](LINKEDIN.md) zum tatsächlichen Stand passend halten.

Ein möglicher späterer Ausbau ist eine zusätzliche fehlerhafte Demo-Quelle mit dokumentiertem Ausfallverhalten. Erst Implementierung und Tests ergänzen, dann das neue Verhalten beschreiben. Echte Produktdaten oder interne Schnittstellen sind dafür nicht erforderlich.
