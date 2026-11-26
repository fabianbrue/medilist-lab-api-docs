#Requires -Version 7.0
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot
$docs = Join-Path $root 'docs'
$site = Join-Path $root '_site'
$config = Get-Content -LiteralPath (Join-Path $docs 'site.json') -Raw | ConvertFrom-Json
New-Item -ItemType Directory -Path $site,(Join-Path $site 'assets'),(Join-Path $site 'downloads') -Force | Out-Null
function Escape-Html([string]$value) { [System.Net.WebUtility]::HtmlEncode($value) }
foreach ($page in $config.pages) {
  $markdown = Get-Content -LiteralPath (Join-Path $docs $page.file) -Raw
  $match = [regex]::Match($markdown, '(?s)^---\r?\n(?<meta>.*?)\r?\n---\r?\n')
  if (-not $match.Success) { throw ('Missing documentation front matter: '+$page.file) }
  $titleMatch = [regex]::Match($match.Groups['meta'].Value, '(?m)^title:\s*(.+)$')
  if (-not $titleMatch.Success) { throw ('Missing title: '+$page.file) }
  $title = Escape-Html $titleMatch.Groups[1].Value.Trim()
  $body = (ConvertFrom-Markdown -InputObject $markdown.Substring($match.Length)).Html
  $body = $body -replace 'href="([^"/:]+)\.md(#[^"]*)?"', 'href="$1.html$2"'
  $body = $body.Replace('../api/openapi.json','downloads/openapi.json').Replace('../postman/medilist.postman_collection.json','downloads/medilist.postman_collection.json').Replace('../postman/medilist.postman_environment.json','downloads/medilist.postman_environment.json')
  $nav = foreach ($link in $config.pages) {
    $url = [IO.Path]::ChangeExtension($link.file,'.html')
    $current = if ($link.file -eq $page.file) { ' aria-current="page"' } else { '' }
    '<a href="'+$url+'"'+$current+'>'+(Escape-Html $link.label)+'</a>'
  }
  $badge = if ($config.status -eq 'portfolio-ready') { 'PORTFOLIO PROJECT' } else { 'LEARNING SCAFFOLD · REVIEW PENDING' }
  $notice = if ($config.status -eq 'portfolio-ready') { 'Independent synthetic API · no clinical assessment · local demo' } else { 'Independent learning scaffold with synthetic data. Not an Oracle Health, i.s.h.med or ePA product API. No clinical assessment.' }
  $html = @"
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="$(Escape-Html $config.description)"><title>$title | MediList Lab</title><link rel="stylesheet" href="assets/style.css"><script src="assets/console.js" defer></script></head>
<body><a class="skip" href="#main">Skip to content</a><div class="shell"><aside><a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">↗</span> MediList Lab<span class="brand-sub">API DOCUMENTATION</span></a><p class="eyebrow">DEVELOPER GUIDE</p><nav aria-label="Documentation">$($nav -join "`n")</nav><div class="sidebar-note"><strong>Small API. Clear contracts.</strong><p>Synthetic lists, source provenance, versioned status and traceable events.</p><a href="downloads/openapi.json">Download OpenAPI ↗</a></div></aside><div class="page"><header><span>$badge</span><span class="version">v0.1.0</span></header><main id="main"><p class="notice">$notice</p><article>$body</article></main><footer>MediList Lab is an independent documentation learning project. <a href="case-study.html">Scope, evidence &amp; authorship</a>.</footer></div></div></body></html>
"@
  [IO.File]::WriteAllText((Join-Path $site ([IO.Path]::ChangeExtension($page.file,'.html'))),$html,[Text.UTF8Encoding]::new($false))
}
Copy-Item -LiteralPath (Join-Path $docs 'assets/style.css'),(Join-Path $docs 'assets/console.js') -Destination (Join-Path $site 'assets') -Force
Copy-Item -LiteralPath (Join-Path $root 'api/openapi.json'),(Join-Path $root 'postman/medilist.postman_collection.json'),(Join-Path $root 'postman/medilist.postman_environment.json') -Destination (Join-Path $site 'downloads') -Force
[IO.File]::WriteAllText((Join-Path $site '.nojekyll'),'')
Write-Output ('Built '+$config.pages.Count+' documentation pages in '+$site)
