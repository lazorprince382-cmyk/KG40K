$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$sourceDirectory = 'D:\Downloads'
$outputDirectory = Join-Path $PSScriptRoot '..\storage\official-text'
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
foreach ($file in $files) {
  $source = Join-Path $sourceDirectory $file
  $archive = [IO.Compression.ZipFile]::OpenRead($source)
  try {
    $entry = $archive.GetEntry('word/document.xml')
    $reader = New-Object IO.StreamReader($entry.Open())
    try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
    $namespace = New-Object Xml.XmlNamespaceManager($xml.NameTable)
    $namespace.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
    $paragraphs = foreach ($paragraph in $xml.SelectNodes('//w:body/w:p | //w:body/w:tbl/w:tr/w:tc/w:p',$namespace)) {
      $parts = foreach ($text in $paragraph.SelectNodes('.//w:t',$namespace)) { $text.InnerText }
      if ($parts.Count) { ($parts -join '') }
    }
    $safeName = ([IO.Path]::GetFileNameWithoutExtension($file) -replace '[^A-Za-z0-9._-]', '-') + '.txt'
    $target = Join-Path $outputDirectory $safeName
    [IO.File]::WriteAllText($target,($paragraphs -join [Environment]::NewLine),[Text.UTF8Encoding]::new($false))
    Write-Output $target
  } finally { $archive.Dispose() }
}
