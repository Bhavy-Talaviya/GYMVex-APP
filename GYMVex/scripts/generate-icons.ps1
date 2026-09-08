Add-Type -AssemblyName System.Drawing

$src = "C:\Users\bhavy\.gemini\antigravity-ide\brain\e3b679f9-e05a-4b62-aeb3-b1e1e8d98357\gymvex_app_logo_1788584213646.jpg"
$destDir = "c:\Users\bhavy\Desktop\GYM-APP\GYMVex\assets\images"

$orig = [System.Drawing.Image]::FromFile($src)

function Save-Resized($width, $height, $filename) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.DrawImage($orig, 0, 0, $width, $height)
    $outPath = Join-Path $destDir $filename
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $filename ($width x $height)"
}

# 1. Main Icon (1024x1024)
Save-Resized 1024 1024 "icon.png"

# 2. Android Adaptive Icon Foreground (1024x1024)
Save-Resized 1024 1024 "android-icon-foreground.png"

# 3. Android Adaptive Icon Background (1024x1024)
Save-Resized 1024 1024 "android-icon-background.png"

# 4. Android Monochrome Icon (1024x1024)
Save-Resized 1024 1024 "android-icon-monochrome.png"

# 5. Splash Screen Icon (1024x1024)
Save-Resized 1024 1024 "splash-icon.png"

# 6. Web Favicon (192x192)
Save-Resized 192 192 "favicon.png"

$orig.Dispose()
Write-Host "All assets generated successfully!"
