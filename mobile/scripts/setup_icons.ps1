# PowerShell Script: Setup ATAK Logo & Android Launcher Icons
param()

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = $scriptDir
while ($rootDir -and (-not (Test-Path (Join-Path $rootDir "frontend\public\atak.png")))) {
    $parent = Split-Path -Parent $rootDir
    if ($parent -eq $rootDir) { break }
    $rootDir = $parent
}

$srcLogo = Join-Path $rootDir "frontend\public\atak.png"
$srcMascot = Join-Path $rootDir "frontend\public\atak-portal.png"
$mobileDir = Join-Path $rootDir "mobile"
$assetsDir = Join-Path $mobileDir "assets\images"
$resDir = Join-Path $mobileDir "android\app\src\main\res"

if (-not (Test-Path $srcLogo)) {
    Write-Error "File logo ATAK tidak ditemukan di: $srcLogo"
    exit 1
}

# 1. Pastikan folder assets/images di mobile ada
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
    Write-Host "Dibuat folder: $assetsDir"
}

# Copy logo & mascot ke assets Flutter
Copy-Item -Path $srcLogo -Destination (Join-Path $assetsDir "atak.png") -Force
Write-Host "Disalin: atak.png -> mobile\assets\images\atak.png"

if (Test-Path $srcMascot) {
    Copy-Item -Path $srcMascot -Destination (Join-Path $assetsDir "atak-portal.png") -Force
    Write-Host "Disalin: atak-portal.png -> mobile\assets\images\atak-portal.png"
}

# 2. Generate Mipmap Icons untuk Android menggunakan Maskot Manusia SI ATAK
$densities = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

$iconSource = if (Test-Path $srcMascot) { $srcMascot } else { $srcLogo }
$img = [System.Drawing.Image]::FromFile($iconSource)

try {
    # Crop bagian atas tubuh (kepala, bulu enggang, ikat kepala Dayak, wajah ramah, dan lambaian tangan)
    $cropW = $img.Width
    $cropH = [int]($img.Height * 0.58)
    $ratio = $cropW / $cropH

    foreach ($folder in $densities.Keys) {
        $size = $densities[$folder]
        $targetFolder = Join-Path $resDir $folder
        if (-not (Test-Path $targetFolder)) {
            New-Item -ItemType Directory -Path $targetFolder -Force | Out-Null
        }

        # Hitung ukuran gambar di dalam kanvas dengan padding agar pas saat dipotong melingkar oleh Android
        $maxInner = [int]($size * 0.84)
        $targetH = $maxInner
        $targetW = [int]($targetH * $ratio)
        if ($targetW -gt $maxInner) {
            $targetW = $maxInner
            $targetH = [int]($targetW / $ratio)
        }

        $x = [int](($size - $targetW) / 2)
        $y = [int](($size - $targetH) / 2)

        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        
        # Bersihkan dengan warna putih bersih
        $g.Clear([System.Drawing.Color]::White)
        
        # Gambar maskot Si ATAK (portrait atas) tepat di tengah kanvas
        $destRect = New-Object System.Drawing.Rectangle($x, $y, $targetW, $targetH)
        $srcRect = New-Object System.Drawing.Rectangle(0, 0, $cropW, $cropH)
        $g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()

        $outPath = Join-Path $targetFolder "ic_launcher.png"
        $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()

        Write-Host "Berhasil membuat icon Maskot SI ATAK: $folder\ic_launcher.png (${size}x${size})"
    }
}
finally {
    $img.Dispose()
}

Write-Host "=================================================="
Write-Host " Sukses memperbarui seluruh Icon Logo PTSP SI ATAK!"
Write-Host "=================================================="
