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
    "[Cc]ourse[s]?"
    "[Ll]earn(ing)?"
    "[Tt]rain(ing|ed)?"
    "[Ll]esson[s]?"
    "[Mm]odule[s]?"
    "[Ss]tudent[s]?"
    "[Ee]nroll(ment|ed)?"
    "[Cc]ertificat(e|ion)[s]?"
    "[Ff]undamentals"
    "[Cc]oach(ing)?"
    "[Mm]entor(ship)?"
    "What You.ll Learn"
    "Start Learning"
    "Enroll Now"
)

# Allowed exceptions (files or patterns to skip)
EXCEPTIONS=(
    "check-forbidden-terms.sh"  # This script itself
    "PRODUCT_POSITIONING.md"     # Documentation about the rules
    "layout.tsx"                 # Contains the positioning comment
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

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
    # Use grep to find matches
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

echo "=============================================="

if [ $VIOLATIONS_FOUND -eq 1 ]; then
    echo -e "${RED}FAILED:${NC} Found $TOTAL_VIOLATIONS forbidden term(s)"
    echo ""
    echo "MC2 Estimating is a PRODUCT company, NOT an education platform."
    echo "Please remove or replace the forbidden terms above."
    echo ""
    echo "Allowed alternatives:"
    echo "  - Courses -> Tools, Programs, Resources"
    echo "  - Learn/Learning -> Use, Access, Documentation"
    echo "  - Training -> Tools, Resources, Guides"
    echo "  - Student -> User, Customer"
    echo "  - Enroll -> Get Access, Download, Start"
    echo "  - Module -> Section, Component, Part"
    echo "  - Certificate -> Proof of purchase, Documentation"
    echo ""
    exit 1
else
    echo -e "${GREEN}PASSED:${NC} No forbidden terms found"
    echo "Product positioning is clean."
    exit 0
fi
