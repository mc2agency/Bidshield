#!/bin/bash
#
# MC2 Estimating - Forbidden Terms Checker
# ========================================
# This script scans the codebase for education-related terminology
# that violates the product-only positioning of MC2 Estimating.
#
# Run this in CI to prevent regression of the product positioning.
#
# Usage: ./scripts/check-forbidden-terms.sh
# Exit code: 0 = clean, 1 = violations found

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=============================================="
echo "MC2 Estimating - Forbidden Terms Checker"
echo "=============================================="
echo ""

# Directories to scan
SCAN_DIRS="app components"

# Forbidden terms (case-insensitive patterns)
# These are terms that conflict with product-only positioning
FORBIDDEN_PATTERNS=(
    "Academy"
    "[Ss]tudent[s]?"
    "[Ee]nroll(ment|ed)?"
    "[Cc]oach(ing)?"
    "[Mm]entor(ship)?"
    "What You.ll Learn"
    "Start Learning"
    "Enroll Now"
)

# Patterns that need context checking (may have legitimate uses)
# These are checked but with context-aware filtering
CONTEXT_PATTERNS=(
    "[Cc]ourse[s]?"           # OK in roofing context (starter course, 2 courses of shingles)
    "[Ll]earn(ing)?"          # OK in some SEO/description contexts
    "[Tt]rain(ing|ed)?"       # OK for OSHA safety training
    "[Cc]ertificat(e|ion)[s]?" # OK for industry certs (LEED, COI, etc.)
)

# Allowed exceptions (files or patterns to skip)
EXCEPTIONS=(
    "check-forbidden-terms.sh"  # This script itself
    "PRODUCT_POSITIONING.md"     # Documentation about the rules
    "layout.tsx"                 # Contains the positioning comment
    "sitemap.ts"                 # Contains comments about former names
    "route.ts"                   # Webhook route with comments
)

# Build grep exclusion pattern
EXCLUDE_PATTERN=""
for exc in "${EXCEPTIONS[@]}"; do
    EXCLUDE_PATTERN="$EXCLUDE_PATTERN --exclude=$exc"
done

# Track if any violations found
VIOLATIONS_FOUND=0
TOTAL_VIOLATIONS=0

echo "Scanning directories: $SCAN_DIRS"
echo ""

# Check strict forbidden patterns (no exceptions)
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    MATCHES=$(grep -rniE "$pattern" $SCAN_DIRS $EXCLUDE_PATTERN 2>/dev/null || true)

    if [ -n "$MATCHES" ]; then
        COUNT=$(echo "$MATCHES" | wc -l)
        TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + COUNT))
        VIOLATIONS_FOUND=1

        echo -e "${RED}VIOLATION:${NC} Pattern '$pattern' found:"
        echo "$MATCHES" | head -10
        if [ "$COUNT" -gt 10 ]; then
            echo "  ... and $((COUNT - 10)) more matches"
        fi
        echo ""
    fi
done

# Check context patterns with filtering for legitimate uses
echo -e "${YELLOW}Checking context-sensitive patterns...${NC}"
echo ""

# Course - filter out roofing terminology
COURSE_MATCHES=$(grep -rniE "[Cc]ourse[s]?" $SCAN_DIRS $EXCLUDE_PATTERN 2>/dev/null | \
    grep -viE "starter course|2 courses|shingle course|tile course|formerly" || true)
if [ -n "$COURSE_MATCHES" ]; then
    COUNT=$(echo "$COURSE_MATCHES" | wc -l)
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + COUNT))
    VIOLATIONS_FOUND=1
    echo -e "${RED}VIOLATION:${NC} Pattern 'course' found (non-roofing context):"
    echo "$COURSE_MATCHES" | head -5
    echo ""
fi

# Training - filter out OSHA/safety training (legitimate) and blog posts (informational)
TRAIN_MATCHES=$(grep -rniE "[Tt]rain(ing|ed)?" $SCAN_DIRS $EXCLUDE_PATTERN 2>/dev/null | \
    grep -viE "OSHA|safety|competent person|fall protection|hazcom|restraints|disruption|specialized|equipment|support|hours|we trained|API|team" | \
    grep -v "app/blog/" || true)
if [ -n "$TRAIN_MATCHES" ]; then
    COUNT=$(echo "$TRAIN_MATCHES" | wc -l)
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + COUNT))
    VIOLATIONS_FOUND=1
    echo -e "${RED}VIOLATION:${NC} Pattern 'training' found (non-safety context):"
    echo "$TRAIN_MATCHES" | head -5
    echo ""
fi

# Certificate - filter out industry certifications (legitimate) and blog posts
CERT_MATCHES=$(grep -rniE "[Cc]ertificat(e|ion)[s]?" $SCAN_DIRS $EXCLUDE_PATTERN 2>/dev/null | \
    grep -viE "LEED|COI|Certificate of Insurance|certificates of insurance|DBE|MBE|WBE|manufacturer|inspection|test report|industry|insurance|FM approval|warranty|fire rating|specialized|required|GAF|Tremco|PPE|OSHA|Missing|Specific" | \
    grep -v "app/blog/" || true)
if [ -n "$CERT_MATCHES" ]; then
    COUNT=$(echo "$CERT_MATCHES" | wc -l)
    TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + COUNT))
    VIOLATIONS_FOUND=1
    echo -e "${RED}VIOLATION:${NC} Pattern 'certificate' found (non-industry context):"
    echo "$CERT_MATCHES" | head -5
    echo ""
fi

# Learn - check for remaining learn patterns (some SEO uses are OK, blog posts are informational)
LEARN_MATCHES=$(grep -rniE "[Ll]earn(ing)?" $SCAN_DIRS $EXCLUDE_PATTERN 2>/dev/null | \
    grep -viE "keywords|description.*Learn|Learn more about|formerly" | \
    grep -v "app/blog/" || true)
if [ -n "$LEARN_MATCHES" ]; then
    COUNT=$(echo "$LEARN_MATCHES" | wc -l)
    # Only flag if more than a few matches (some edge cases are OK)
    if [ "$COUNT" -gt 5 ]; then
        TOTAL_VIOLATIONS=$((TOTAL_VIOLATIONS + COUNT))
        VIOLATIONS_FOUND=1
        echo -e "${RED}VIOLATION:${NC} Pattern 'learn' found frequently ($COUNT times):"
        echo "$LEARN_MATCHES" | head -5
        echo ""
    else
        echo -e "${YELLOW}INFO:${NC} Pattern 'learn' found $COUNT times (acceptable for SEO)"
    fi
fi

echo "=============================================="

if [ $VIOLATIONS_FOUND -eq 1 ]; then
    echo -e "${RED}FAILED:${NC} Found $TOTAL_VIOLATIONS forbidden term(s)"
    echo ""
    echo "MC2 Estimating is a PRODUCT company, NOT an education platform."
    echo "Please remove or replace the forbidden terms above."
    echo ""
    echo "Allowed alternatives:"
    echo "  - Courses -> Tools, Programs, Resources"
    echo "  - Learn/Learning -> Use, Master, Access"
    echo "  - Training -> Tools, Resources, Guides (except OSHA safety)"
    echo "  - Student -> User, Customer"
    echo "  - Enroll -> Get Access, Download, Start"
    echo "  - Certificate -> Badge, Proof (except industry certs like COI, LEED)"
    echo ""
    exit 1
else
    echo -e "${GREEN}PASSED:${NC} No forbidden terms found"
    echo "Product positioning is clean."
    exit 0
fi
