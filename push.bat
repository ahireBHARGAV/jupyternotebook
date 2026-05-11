@echo off
echo Pushing latest changes to GitHub...
git add .
git commit -m "feat: static files and UI updates"
git push
echo.
echo Done! Press any key to close this window.
pause > nul
