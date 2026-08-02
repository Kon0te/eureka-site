param([switch]$Production)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$patterns = @(
  "TODO",
  "FIXME",
  "À compléter",
  "A compléter",
  "PLACEHOLDER",
  "example.com",
  "example.org",
  "contact@example",
  "support@example",
  "SIREN_PLACEHOLDER",
  "SIRET_PLACEHOLDER",
  "ADDRESS_PLACEHOLDER",
  "MEDIATOR_PLACEHOLDER",
  "MÉDIATEUR À DÉSIGNER",
  "DATE À DÉFINIR",
  "DATE À COMPLÉTER",
  "Lorem ipsum",
  "John Doe",
  "Jane Doe"
)

$allowedExtensions = @(".html", ".json", ".xml", ".txt")
$files = Get-ChildItem -LiteralPath $root -Recurse -File |
  Where-Object {
    $_.FullName -notmatch "\\admin\\" -and
    $allowedExtensions -contains $_.Extension -and
    $_.Name -notin @("check-legal-content.ps1", "test-legal-routes.ps1")
  }

$matches = foreach ($file in $files) {
  foreach ($pattern in $patterns) {
    Select-String -LiteralPath $file.FullName -Pattern $pattern -SimpleMatch |
      ForEach-Object {
        [pscustomobject]@{
          File = $_.Path.Replace($root, ".")
          Line = $_.LineNumber
          Pattern = $pattern
          Text = $_.Line.Trim()
        }
      }
  }
}

if ($matches) {
  $matches | Format-Table -AutoSize
  throw "Legal content check failed."
}

$config = Get-Content -LiteralPath (Join-Path $root "legal-config.json") -Raw | ConvertFrom-Json
if ($config.siren -notmatch '^\d{9}$') { throw "Invalid SIREN." }
if ($config.siret -notmatch '^\d{14}$') { throw "Invalid SIRET." }
if ($config.supportEmail -notmatch '^[^@\s]+@[^@\s]+\.[^@\s]+$') { throw "Invalid support email." }
if ($config.domain -notmatch '^https://') { throw "Legal domain must use HTTPS." }
if ($config.mediatorWebsite -notmatch '^https://') { throw "Mediator URL must use HTTPS." }

Write-Host "Legal content check completed."
