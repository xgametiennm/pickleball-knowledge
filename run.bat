@echo off
chcp 65001 >nul
cd /d "%~dp0"
set PORT=%1
if "%PORT%"=="" set PORT=8000
set PYTHONIOENCODING=utf-8
where python >nul 2>nul && (set PY=python) || (where py >nul 2>nul && (set PY=py) || (echo Khong tim thay Python 3. Cai tai https://www.python.org ^(tich "Add Python to PATH"^) roi chay lai. & pause & exit /b 1))
echo ==^> Build trang web
%PY% build.py || (pause & exit /b 1)
echo.
echo ==^> Dang chay tai: http://localhost:%PORT%/so-tay-pickleball.html
echo     Bam Ctrl+C de dung.
start "" "http://localhost:%PORT%/so-tay-pickleball.html"
cd dist
%PY% -m http.server %PORT%
