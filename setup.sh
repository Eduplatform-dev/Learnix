#!/usr/bin/env bash
# =============================================================
# Learnix — apply ALL crash / security / broken / warning fixes
# Run from the PROJECT ROOT:  bash learnix-fixes/setup.sh
# =============================================================

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()    { echo -e "${GREEN}  ✅  $1${NC}"; }
warn()  { echo -e "${YELLOW}  ⚠️   $1${NC}"; }
err()   { echo -e "${RED}  ❌  $1${NC}"; exit 1; }
header(){ echo -e "\n${BLUE}── $1 ──────────────────────────────────${NC}"; }

FIXES="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Learnix — Full Fix Script          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

[ -f "package.json" ] || err "Run from project root (where package.json lives)"
[ -d "server" ]       || err "server/ directory not found"

# ── 1. Create .env files if missing ────────────────────────
header "Environment"

if [ ! -f "server/.env" ]; then
  cp "$FIXES/server/.env.example" server/.env
  warn "Created server/.env — EDIT IT: set MONGO_URI and JWT_SECRET"
else
  ok "server/.env exists"
fi

if [ ! -f ".env" ]; then
  echo "VITE_API_BASE_URL=http://localhost:5000" > .env
  ok "Created root .env"
else
  ok "Root .env exists"
fi

# ── 2. Rename mis-cased middleware ──────────────────────────
header "File rename"

OLD="server/src/middleware/uploadMIddleware.js"
NEW="server/src/middleware/uploadMiddleware.js"
if [ -f "$OLD" ] && [ ! -f "$NEW" ]; then
  mv "$OLD" "$NEW"
  ok "Renamed uploadMIddleware.js → uploadMiddleware.js"
elif [ -f "$NEW" ]; then
  ok "uploadMiddleware.js correctly named"
fi

# ── 3. Copy all fixed files ─────────────────────────────────
header "Applying fixes"

cp_fix(){ local s="$FIXES/$1" d="$1"; [ -f "$s" ] && { mkdir -p "$(dirname "$d")"; cp "$s" "$d"; ok "Updated: $d"; } || warn "Not found in fixes: $1"; }

# Config / infra
cp_fix server/src/config/env.js
cp_fix server/src/config/db.js
cp_fix server/package.json
cp_fix server/.env.example
cp_fix server/src/scripts/seed.js
cp_fix package.json
cp_fix vite.config.ts
cp_fix .env.example

# Middleware
cp_fix server/src/middleware/auth.js
cp_fix server/src/middleware/errorHandler.js
cp_fix server/src/middleware/uploadMiddleware.js

# Models
cp_fix server/src/models/Submission.js

# Controllers
cp_fix server/src/controllers/contentController.js
cp_fix server/src/controllers/assignmentController.js
cp_fix server/src/controllers/adminController.js
cp_fix server/src/controllers/courseController.js

# Routes
cp_fix server/src/routes/adminRoutes.js
cp_fix server/src/routes/aiRoutes.js
cp_fix server/src/routes/assignmentRoutes.js
cp_fix server/src/routes/contentRoutes.js
cp_fix server/src/routes/courseRoutes.js
cp_fix server/src/routes/feeRoutes.js
cp_fix server/src/routes/submissionRoutes.js
cp_fix server/src/routes/userRoutes.js

# Server entry
cp_fix server/src/index.js

# Frontend components
cp_fix src/app/components/pages/student/AIChat.tsx
cp_fix src/app/components/pages/admin/AdminCourses.tsx

# Frontend services
cp_fix src/app/services/adminService.ts
cp_fix src/app/services/authService.ts
cp_fix src/app/services/contentService.ts
cp_fix src/app/services/courseService.ts
cp_fix src/app/services/feeService.ts
cp_fix src/app/services/submissionService.ts

# Providers
cp_fix src/app/providers/AuthProvider.tsx

# Tests
cp_fix src/test/setup.ts
cp_fix src/test/auth.test.ts
cp_fix src/test/adminService.test.ts
cp_fix src/test/courseService.test.ts
cp_fix src/test/feeService.test.ts
cp_fix src/test/submissionService.test.ts

# CI/CD
mkdir -p .github/workflows
cp_fix .github/workflows/ci.yml

# ── 4. Remove orphaned files ────────────────────────────────
header "Cleanup"

for f in \
  "server/src/controllers/aiController.js" \
  "server/src/middleware/uploadMIddleware.js"
do
  [ -f "$f" ] && { rm "$f"; ok "Removed orphan: $f"; }
done

# ── 5. Install dependencies ─────────────────────────────────
header "Dependencies"

npm --prefix server install --silent && ok "Server deps installed (multer 2.x)"
npm install --silent && ok "Root deps installed"

# ── 6. Run tests ────────────────────────────────────────────
header "Tests"

if npm test -- --run 2>&1 | tail -25; then
  ok "Tests complete"
else
  warn "Some tests failed — check output above"
fi

# ── 7. Optional seed ────────────────────────────────────────
echo ""
read -p "  Seed demo database? (y/N) " s
if [[ "$s" =~ ^[Yy]$ ]]; then
  npm --prefix server run seed && ok "Database seeded"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        All fixes applied!  ✅            ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "  Next steps:"
echo "  1. Edit server/.env — set MONGO_URI + JWT_SECRET"
echo "  2. (Optional) Add ANTHROPIC_API_KEY to server/.env for AI chat"
echo "  3. npm run dev:full"
echo "  4. curl http://localhost:5000/health"
echo ""
echo "  Demo accounts (after seeding):"
echo "    Admin:   admin@learnix.com   / admin123"
echo "    Student: student@learnix.com / student123"
echo ""