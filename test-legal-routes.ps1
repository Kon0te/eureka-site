$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$routes = @(
  "index.html",
  "mentions-legales/index.html",
  "conditions/index.html",
  "confidentialite/index.html",
  "suppression-compte/index.html",
  "contact/index.html"
)

foreach ($route in $routes) {
  $path = Join-Path $root $route
  if (-not (Test-Path -LiteralPath $path)) { throw "Missing route file: $route" }
  $content = Get-Content -LiteralPath $path -Raw
  if ($content -notmatch "<h1") { throw "Missing h1 in $route" }
  if ($content -notmatch "<title>") { throw "Missing title in $route" }
  if ($content -notmatch "site-footer") { throw "Missing footer in $route" }
}

Write-Host "Legal route test completed."
