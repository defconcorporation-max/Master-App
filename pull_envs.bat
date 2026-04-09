@echo off
echo Pulling Auclaire Production DB...
cd ..\Auclaire\"Auclaire APP"
call vercel link --project auclaire --scope defcon-corps-projects --yes
call vercel env pull .env.production --environment production --yes

echo Pulling Defcon Production DB...
cd ..\..\defcon app
call vercel link --project defcon-app --scope defcon-corps-projects --yes
call vercel env pull .env.production --environment production --yes

echo Pulling Antigravity Agents Production DB...
cd ..\"antigravity agents"
call vercel link --project travel-agency-app-ew9j --scope defcon-corps-projects --yes
call vercel env pull .env.production --environment production --yes

echo Done! Returning to master app...
cd ..\"master app"
