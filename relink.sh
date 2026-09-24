#!/usr/bin/env bash
# Link every skill in this repo into the shared agent hub and each provider's
# skill directory, so there is exactly one real copy of each skill.
#
#   repo/skills/<name>  <-- ~/.agents/skills/<name>  <-- ~/.claude/skills/<name>
#                                                    <-- ~/.codex/skills/<name>
#
# Dry run by default. Pass --apply to make changes.
# Refuses to replace a real directory whose content differs from this repo.

set -uo pipefail

REPO_SKILLS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skills"
HUB="$HOME/.agents/skills"
PROVIDERS=("$HOME/.claude/skills" "$HOME/.codex/skills")

APPLY=0
[[ "${1:-}" == "--apply" ]] && APPLY=1

c_ok=$'\033[32m'; c_new=$'\033[36m'; c_warn=$'\033[33m'; c_err=$'\033[31m'; c_off=$'\033[0m'
n_ok=0; n_create=0; n_replace=0; n_refuse=0

say() { printf '  %s%-9s%s %-34s %s\n' "$2" "$1" "$c_off" "$3" "${4:-}"; }

# same_content <dir_a> <dir_b>
same_content() {
  diff -r -q -x '.DS_Store' "$1" "$2" >/dev/null 2>&1
}

# link <target> <linkpath> <label> <canonical>
#   target    what the symlink points at (hub for providers, repo for the hub)
#   canonical the repo directory, always used for content comparison
link() {
  local target="$1" linkpath="$2" label="$3" canonical="$4"

  if [[ -L "$linkpath" ]]; then
    if [[ "$(readlink "$linkpath")" == "$target" || "$(cd "$(dirname "$linkpath")" && realpath "$linkpath" 2>/dev/null)" == "$(realpath "$target")" ]]; then
      say OK "$c_ok" "$label"; ((n_ok++)); return
    fi
    say REPLACE "$c_warn" "$label" "symlink -> $(readlink "$linkpath")"
    ((n_replace++))
    [[ $APPLY == 1 ]] && { rm "$linkpath"; ln -s "$target" "$linkpath"; }
    return
  fi

  if [[ -d "$linkpath" ]]; then
    if same_content "$linkpath" "$canonical"; then
      say REPLACE "$c_warn" "$label" "real dir, content identical"
      ((n_replace++))
      [[ $APPLY == 1 ]] && { rm -rf "$linkpath"; ln -s "$target" "$linkpath"; }
    else
      say REFUSE "$c_err" "$label" "real dir, CONTENT DIFFERS - left untouched"
      ((n_refuse++))
    fi
    return
  fi

  if [[ -e "$linkpath" ]]; then
    say REFUSE "$c_err" "$label" "exists and is not a directory - left untouched"
    ((n_refuse++)); return
  fi

  say CREATE "$c_new" "$label"
  ((n_create++))
  [[ $APPLY == 1 ]] && ln -s "$target" "$linkpath"
}

[[ -d "$REPO_SKILLS" ]] || { echo "No skills/ directory beside this script." >&2; exit 1; }
[[ $APPLY == 1 ]] || echo "DRY RUN - nothing will change. Re-run with --apply to commit."
echo "source: $REPO_SKILLS"
mkdir -p "$HUB"

for dir in "$REPO_SKILLS"/*/; do
  name="$(basename "$dir")"
  echo; echo "$name"
  link "${dir%/}"      "$HUB/$name"   "~/.agents/skills" "${dir%/}"
  for p in "${PROVIDERS[@]}"; do
    [[ -d "$p" ]] || { say SKIP "$c_warn" "${p/#$HOME/~}" "provider dir does not exist"; continue; }
    link "$HUB/$name" "$p/$name"      "${p/#$HOME/~}" "${dir%/}"
  done
done

# dangling links left behind by removed skills
echo; echo "orphan check"
for p in "$HUB" "${PROVIDERS[@]}"; do
  [[ -d "$p" ]] || continue
  for l in "$p"/*; do
    [[ -L "$l" ]] || continue
    [[ -e "$l" ]] && continue
    say ORPHAN "$c_err" "${p/#$HOME/~}/$(basename "$l")" "-> $(readlink "$l")"
  done
done

echo
printf 'ok=%d  create=%d  replace=%d  refuse=%d\n' "$n_ok" "$n_create" "$n_replace" "$n_refuse"
[[ $APPLY == 1 ]] || echo "Nothing was changed."
