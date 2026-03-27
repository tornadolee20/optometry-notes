$files = Get-ChildItem -Path 'c:\Users\torna_3j3fz9h\Dropbox\PC (2)\Desktop\uncleglasses\optometry-notes\content-planning\*Claude*'
foreach ($file in $files) {
    $text = [System.IO.File]::ReadAllText($file.FullName)
    $n = 0
    foreach ($ch in $text.ToCharArray()) {
        $code = [int]$ch
        if ($code -ge 19968 -and $code -le 40959) { $n++ }
    }
    Write-Host "File: $($file.Name) | CJK chars: $n"
}
