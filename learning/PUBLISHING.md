# Veröffentlichung und Lernnachweise

Die öffentliche Dokumentation ist ein **unabhängiges, KI-unterstütztes Lernprojekt in Arbeit**. Das ist ein ehrlicher Veröffentlichungsstand. Er bedeutet weder Kursabschluss noch fertige eigene Portfolio-Leistung.

`docs/site.json` enthält deshalb `learning-scaffold`. `node scripts/check.mjs --publish` prüft die passende Kennzeichnung und Artefaktkonsistenz. Der manuell gestartete Pages-Workflow führt HTTP-Tests, Konsistenzprüfung, Build und Linkprüfung vor der Veröffentlichung aus.

## Nach eigener Bearbeitung

1. Die acht Aufgaben in [PROJECT_BRIEF.md](PROJECT_BRIEF.md) tatsächlich durchführen.
2. `evidence.json` mit echten Ergebnissen ergänzen; keine Beispielergebnisse als eigenen Nachweis übernehmen.
3. Die Case Study durch eine eigene Darstellung ersetzen: Problem, Entscheidungen, eigene Änderungen, KI-Beitrag, Leserfeedback und Grenzen.
4. Erst danach den README-Status und `docs/site.json` auf `portfolio-ready` setzen.
5. `node --test`, `node scripts/check.mjs --release`, Website-Build und `node scripts/check.mjs --site` ausführen.

Der Release-Check prüft die **vorhandenen Angaben**, nicht deren inhaltliche Wahrheit oder die Konformität einer realen Healthcare-Anwendung. Eine eigenständige OpenAPI-Validierung bleibt Teil deiner Aufgaben. Ein Kurszertifikat wird durch dieses Projekt nicht ausgestellt.

## Inhaltliche Grenze

Nur synthetische Daten und frei entworfene Beispiele veröffentlichen. Keine reale Produktimplementierung oder Arbeitgeberfreigabe behaupten. Der öffentliche Demo-Key und die Rollen-Header sind absichtlich öffentlich und keine Zugangsdaten zu einem klinischen System. GitHub Pages führt die API nicht aus; die ausführbare Demo bleibt lokal.

Für LinkedIn: Lernprojekt und Zusammenarbeit mit Codex sichtbar nennen, konkrete eigene Lernergebnisse erst nach tatsächlicher Prüfung ergänzen. Die Vorlage wird nicht automatisch auf LinkedIn gepostet.
