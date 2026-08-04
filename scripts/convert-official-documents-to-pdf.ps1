$ErrorActionPreference = 'Stop'
$sourceDirectory = 'D:\Downloads'
$outputDirectory = Join-Path $PSScriptRoot '..\storage\official-pdf'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
$files = @(
  'Welfare policy_G40 Kwagalana_5.7.2025.docx',
  'INVESTMENT REPORT FOR KASANGATI G40 KWAGALANA AGM (1).docx',
  'RESOLUTION OF KASANGATI G40 KWAGALANA LIMITED.docx',
  'kwagalana AGM 2025 Minutes.docx',
  '2025 AGM ACTIONS POINTS.docx',
  '2026 AGM MINUTES_KASANGATI G40 KWAGALANA LIMITED.docx',
  'INVESTMENT REPORT FOR KASANGATI G40 KWAGALANA AGM.docx',
  'kasangati g40 kwagalana loan agreement (2).docx',
  'KASANGATI G40 KWAGALANA LTD (Private Limited By Shares.docx'
)
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
  foreach ($file in $files) {
    $source = Join-Path $sourceDirectory $file
    if (-not (Test-Path -LiteralPath $source)) { throw "Official document not found: $source" }
    $safeName = ([IO.Path]::GetFileNameWithoutExtension($file) -replace '[^A-Za-z0-9._-]', '-') + '.pdf'
    $target = Join-Path $outputDirectory $safeName
    $document = $word.Documents.Open($source, $false, $true)
    try { $document.ExportAsFixedFormat($target, 17) } finally { $document.Close($false) }
    Write-Output $target
  }
} finally {
  $word.Quit()
  [Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
