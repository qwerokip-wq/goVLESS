#!/usr/bin/env bash
#
# deploy-manifest.sh — read-only deploy drift diagnostic.
#
# Prints the sha256 of every deployed goVLESS source file under
#   /opt/govless/{govlessctl,bot,webapp}
# and, when an installer source tree is present, compares each file against
#   /opt/govless-installer/phase-a/{govlessctl,bot,webapp}
# listing any DRIFT (deployed != source). Makes NO changes to the system.
#
set -euo pipefail

DEPLOY_ROOT="/opt/govless"
SRC_ROOT="/opt/govless-installer/phase-a"
SUBDIRS=(govlessctl bot webapp)

# Pick a sha256 implementation (sha256sum on Linux, shasum -a 256 as fallback).
_sha256() {
    local f="$1"
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$f" | awk '{print $1}'
    elif command -v shasum >/dev/null 2>&1; then
        shasum -a 256 "$f" | awk '{print $1}'
    else
        echo "ERR-no-sha256-tool"
        return 1
    fi
}

drift_count=0
deployed_count=0
missing_src_count=0

echo "== goVLESS deploy manifest =="
echo "deployed:  ${DEPLOY_ROOT}"
if [ -d "$SRC_ROOT" ]; then
    echo "source:    ${SRC_ROOT}"
else
    echo "source:    ${SRC_ROOT} (NOT PRESENT — hashes only, no comparison)"
fi
echo

for sub in "${SUBDIRS[@]}"; do
    deploy_dir="${DEPLOY_ROOT}/${sub}"
    if [ ! -d "$deploy_dir" ]; then
        echo "[skip] ${deploy_dir} (not deployed)"
        continue
    fi

    echo "--- ${sub} ---"
    # NUL-delimited to survive spaces/odd names; sorted for stable output.
    while IFS= read -r -d '' f; do
        deployed_count=$((deployed_count + 1))
        rel="${f#"${deploy_dir}/"}"
        dhash="$(_sha256 "$f")"

        src_file="${SRC_ROOT}/${sub}/${rel}"
        if [ -d "$SRC_ROOT" ]; then
            if [ -f "$src_file" ]; then
                shash="$(_sha256 "$src_file")"
                if [ "$dhash" != "$shash" ]; then
                    drift_count=$((drift_count + 1))
                    printf 'DRIFT   %s\n          deployed=%s\n          source  =%s\n' \
                        "${sub}/${rel}" "$dhash" "$shash"
                else
                    printf 'ok      %s  %s\n' "${sub}/${rel}" "$dhash"
                fi
            else
                missing_src_count=$((missing_src_count + 1))
                printf 'NO-SRC  %s  %s  (no matching source file)\n' \
                    "${sub}/${rel}" "$dhash"
            fi
        else
            printf '%s  %s\n' "$dhash" "${sub}/${rel}"
        fi
    done < <(find "$deploy_dir" -type f -print0 | sort -z)
    echo
done

echo "== summary =="
echo "deployed files: ${deployed_count}"
if [ -d "$SRC_ROOT" ]; then
    echo "drift:          ${drift_count}"
    echo "no-source:      ${missing_src_count}"
    if [ "$drift_count" -gt 0 ]; then
        echo "RESULT: DRIFT DETECTED"
        exit 1
    fi
    echo "RESULT: in sync"
else
    echo "RESULT: hashes only (installer source tree absent)"
fi
