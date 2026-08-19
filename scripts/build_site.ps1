$root = Split-Path -Parent $PSScriptRoot
$headerDefault = Get-Content (Join-Path $root 'assets\fragments\header.html') -Raw
$headerAlt = Get-Content (Join-Path $root 'assets\fragments\header-alt.html') -Raw
$footer = Get-Content (Join-Path $root 'assets\fragments\footer.html') -Raw

$pages = @(
    Join-Path $root 'index.html'
) + @(Get-ChildItem (Join-Path $root 'pages') -Filter '*.html' | ForEach-Object { $_.FullName }) + @(Get-ChildItem (Join-Path $root 'cities') -Filter '*.html' | ForEach-Object { $_.FullName })

foreach ($page in $pages) {
    $text = Get-Content $page -Raw

    $altPlaceholder = '<div data-site-header data-variant="alt"></div>'
    $defaultPlaceholder = '<div data-site-header data-variant="default"></div>'

    if ($text.Contains($altPlaceholder)) {
        $text = $text.Replace($altPlaceholder, $headerAlt)
    }
    elseif ($text.Contains($defaultPlaceholder)) {
        $text = $text.Replace($defaultPlaceholder, $headerDefault)
    }

    if ($text -match '<div data-site-footer></div>') {
        $text = $text.Replace('<div data-site-footer></div>', $footer)
    }

    $text = [regex]::Replace($text, '(?m)\s*<script src="(?:\.\./)?assets/js/site-fragments\.js" defer><\/script>', '')
    $text = [regex]::Replace($text, "`r?`n\s*<script src='\/(?:\.\./)?assets\/js\/site-fragments\.js'><\/script>\s*", "`r`n")
    $text = [regex]::Replace($text, '(?m)\s*<script src="(?:\.\./)?assets/js/(?:jquery\.min|jquery\.scrollex\.min|jquery\.scrolly\.min|browser\.min|breakpoints\.min|util|main)\.js" defer><\/script>', '')
    $text = [regex]::Replace($text, '(?m)\s*<script src="(?:\.\./)?assets/js/track\.js" defer><\/script>', '')
    $scriptPath = if ($page -like "$root\index.html") { 'assets/js/site-ui.js' } else { '../assets/js/site-ui.js' }
    if ($text -notmatch 'assets/js/site-ui\.js') {
        $text = $text -replace '(?m)(\s*<script src="(?:\.\./)?assets/js/track\.js" defer><\/script>)', "`r`n`t`t`t<script src=`"$scriptPath`" defer></script>`$1"
    }
    $text = [regex]::Replace($text, '(?s)\r?\n\s*<!-- Header -->\r?\n\s*<div data-site-header[^>]*></div>', "")
    $text = [regex]::Replace($text, '(?s)\r?\n\s*<!-- Footer -->\r?\n\s*<div data-site-footer></div>', "")

    [System.IO.File]::WriteAllText($page, $text, [System.Text.UTF8Encoding]::new($false))
}
