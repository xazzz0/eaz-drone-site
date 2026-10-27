$root = Split-Path -Parent $PSScriptRoot
$siteUrl = 'https://www.eazdrones.com'

function Get-CanonicalUrl {
    param([string]$FilePath)
    $relative = Resolve-Path $FilePath | ForEach-Object { $_.Path.Substring($root.Length + 1).Replace('\','/') }
    if ($relative -eq 'index.html') {
        return "$siteUrl/"
    }

    return "$siteUrl/$relative"
}

function Get-TitleAndDescription {
    param([string]$Text)
    $titleMatch = [regex]::Match($Text, '<title>(.*?)</title>', 'Singleline,IgnoreCase')
    $descriptionMatch = [regex]::Match($Text, '<meta name="description" content="([^"]*)"\s*/?>', 'IgnoreCase')
    $title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim() } else { $null }
    $description = if ($descriptionMatch.Success) { $descriptionMatch.Groups[1].Value.Trim() } else { $null }
    return @($title, $description)
}

function New-SocialBlock {
    param(
        [string]$Url,
        [string]$Title,
        [string]$Description
    )

    if ([string]::IsNullOrWhiteSpace($Title)) {
        $Title = 'EAZ Drones'
    }
    if ([string]::IsNullOrWhiteSpace($Description)) {
        $Description = "Professional drone services across Northwest Florida's Emerald Coast."
    }

@"
		<meta property="og:type" content="website" />
		<meta property="og:url" content="$Url" />
		<meta property="og:title" content="$Title" />
		<meta property="og:description" content="$Description" />
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:url" content="$Url" />
		<meta name="twitter:title" content="$Title" />
		<meta name="twitter:description" content="$Description" />
"@
}

$files = @(
    Join-Path $root 'index.html'
) + @(Get-ChildItem (Join-Path $root 'pages') -Filter '*.html' | ForEach-Object { $_.FullName }) + @(Get-ChildItem (Join-Path $root 'cities') -Filter '*.html' | ForEach-Object { $_.FullName })

foreach ($file in $files) {
    $text = Get-Content $file -Raw
    $isCity = $file -like '*\cities\*'
    $variant = if ($file -like '*index.html' -or $text -match 'class="alt"') { 'alt' } else { 'default' }

    $text = $text.Replace('https://www.eazdrones.com/cities\', 'https://www.eazdrones.com/cities/')
    $text = $text.Replace('https://www.eazdrones.com/pages\', 'https://www.eazdrones.com/pages/')

    $headerReplacement = "`r`n`t`t`t`t<!-- Header -->`r`n`t`t`t`t<div data-site-header data-variant='" + $variant + "'></div>"
    $footerReplacement = "`r`n`t`t`t`t<!-- Footer -->`r`n`t`t`t`t<div data-site-footer></div>"

    $text = [regex]::Replace(
        $text,
        '(?s)\r?\n\s*(?:<!-- Header -->\r?\n\s*)?<header id="header".*?</header>',
        $headerReplacement
    )

    $text = [regex]::Replace(
        $text,
        '(?s)\r?\n\s*(?:<!-- Footer -->\r?\n\s*)?<footer id="footer".*?</footer>',
        $footerReplacement
    )

    if ($text -notmatch '/assets/js/site-fragments.js') {
        $text = $text.Replace("`t`t<!-- Scripts -->`r`n", "`t`t<script src='/assets/js/site-fragments.js'></script>`r`n`r`n`t`t<!-- Scripts -->`r`n")
    }

    $canonicalUrl = Get-CanonicalUrl -FilePath $file
    if ($text -notmatch '<link rel="canonical"') {
        $text = $text.Replace('<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />', '<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />' + "`r`n`t`t<link rel=`"canonical`" href=`"" + $canonicalUrl + "`" />")
    }

    if ($isCity -and $text -notmatch 'property="og:type"') {
        $pairs = Get-TitleAndDescription -Text $text
        $socialBlock = New-SocialBlock -Url $canonicalUrl -Title $pairs[0] -Description $pairs[1]
        $text = [regex]::Replace($text, '(?s)(<meta name="description" content="[^"]*"\s*/?>)', "$1`r`n$socialBlock")
    }

    Set-Content -Path $file -Value $text -NoNewline
}
