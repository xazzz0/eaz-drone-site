$root = 'C:\Users\Zoulo\OneDrive\Documents\GitHub\COP3530\eaz-drone-site'
$headerDefault = Get-Content (Join-Path $root 'assets\fragments\header.html') -Raw
$headerAlt = Get-Content (Join-Path $root 'assets\fragments\header-alt.html') -Raw
$footer = Get-Content (Join-Path $root 'assets\fragments\footer.html') -Raw

$pages = @(
    Join-Path $root 'index.html'
) + @(Get-ChildItem (Join-Path $root 'pages') -Filter '*.html' | ForEach-Object { $_.FullName }) + @(Get-ChildItem (Join-Path $root 'cities') -Filter '*.html' | ForEach-Object { $_.FullName })

foreach ($page in $pages) {
    $text = Get-Content $page -Raw

    if ($text -match "<div data-site-header data-variant='alt'></div>") {
        $text = $text.Replace("<div data-site-header data-variant='alt'></div>", $headerAlt)
    }
    elseif ($text -match "<div data-site-header data-variant='default'></div>") {
        $text = $text.Replace("<div data-site-header data-variant='default'></div>", $headerDefault)
    }

    if ($text -match '<div data-site-footer></div>') {
        $text = $text.Replace('<div data-site-footer></div>', $footer)
    }

    $text = [regex]::Replace($text, "`r?`n\s*<script src='\/assets\/js\/site-fragments\.js'><\/script>\s*", "`r`n")
    $text = [regex]::Replace($text, '(?s)\r?\n\s*<!-- Header -->\r?\n\s*<div data-site-header[^>]*></div>', "")
    $text = [regex]::Replace($text, '(?s)\r?\n\s*<!-- Footer -->\r?\n\s*<div data-site-footer></div>', "")

    Set-Content -Path $page -Value $text -NoNewline
}
