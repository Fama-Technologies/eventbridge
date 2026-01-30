Add-Type -AssemblyName System.Drawing

$bitmap = New-Object System.Drawing.Bitmap(192, 192)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

# Fill with blue background
$graphics.Clear([System.Drawing.Color]::FromArgb(79, 70, 229))

# Draw "EB" text
$font = New-Object System.Drawing.Font("Arial", 48, [System.Drawing.FontStyle]::Bold)
$brush = [System.Drawing.Brushes]::White
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center

$graphics.DrawString("EB", $font, $brush, 96, 96, $format)

# Save
$bitmap.Save("$PWD/public/icon-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
$graphics.Dispose()

Write-Host "? Created icon-192x192.png"
