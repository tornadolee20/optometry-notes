param([string]$Path)

if (-not (Test-Path $Path)) {
    Write-Error "File not found: $Path"
    exit 1
}

$TempDir = Join-Path $env:TEMP ([Guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $TempDir | Out-Null

try {
    # .docx is a zip file
    $ZipPath = Join-Path $TempDir "doc.zip"
    Copy-Item $Path $ZipPath
    
    # Extract
    $ExtractDir = Join-Path $TempDir "extracted"
    Expand-Archive -Path $ZipPath -DestinationPath $ExtractDir -Force
    
    $DocumentXml = Join-Path $ExtractDir "word\document.xml"
    if (-not (Test-Path $DocumentXml)) {
        Write-Error "document.xml not found in $Path"
        exit 1
    }
    
    # Extract text from XML
    $XmlText = Get-Content -Path $DocumentXml -Encoding UTF8 -Raw
    [xml]$xml = $XmlText
    $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
    $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
    
    $paragraphs = $xml.SelectNodes("//w:p", $ns)
    foreach ($p in $paragraphs) {
        $text = ""
        $texts = $p.SelectNodes(".//w:t", $ns)
        foreach ($t in $texts) {
            $text += $t.InnerText
        }
        if (-not [string]::IsNullOrWhiteSpace($text)) {
            Write-Output $text
        }
    }
}
finally {
    Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
}
