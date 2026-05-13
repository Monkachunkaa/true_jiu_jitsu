@echo off
REM ============================================================
REM convert_to_webp.bat — Convert all PNG/JPG images to WebP
REM
REM Requirements: cwebp must be installed and on your PATH.
REM   Download: https://developers.google.com/speed/webp/download
REM
REM Usage: Double-click this file or run it from the project root.
REM   It will convert every .png and .jpg/.jpeg in the img folder
REM   to .webp, keeping the originals in place.
REM ============================================================

echo.
echo ========================================
echo   Converting images to WebP...
echo ========================================
echo.

REM Navigate to the img folder relative to this script
cd /d "%~dp0img"

REM Track how many files we convert
set count=0

REM --- Convert all .png files ---
for %%f in (*.png) do (
    echo Converting: %%f
    cwebp -q 80 "%%f" -o "%%~nf.webp"
    set /a count+=1
)

REM --- Convert all .jpg files ---
for %%f in (*.jpg) do (
    echo Converting: %%f
    cwebp -q 80 "%%f" -o "%%~nf.webp"
    set /a count+=1
)

REM --- Convert all .jpeg files ---
for %%f in (*.jpeg) do (
    echo Converting: %%f
    cwebp -q 80 "%%f" -o "%%~nf.webp"
    set /a count+=1
)

echo.
echo ========================================
echo   Done! Converted %count% files.
echo   Originals are still in the img folder.
echo   Delete them manually once you verify.
echo ========================================
echo.

pause
