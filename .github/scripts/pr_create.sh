#!/usr/bin/env bash
# 현재 브랜치의 변경사항을 분석하여 PR 생성 (allowed-tools: Bash(git:*), Bash(gh:*))
# description: "현재 브랜치의 변경사항을 분석하여 상세한 PR을 생성합니다."

set -e
BASE=main
BASE_REF=origin/main

# 1. 브랜치 정보 수집
git fetch origin "$BASE" 2>/dev/null || true
BRANCH=$(git branch --show-current)
echo "::group::브랜치 정보"
echo "현재 브랜치: $BRANCH"
echo "base: $BASE"
echo "::endgroup::"

# 원격 브랜치 없으면 push
if ! git rev-parse --verify "origin/$BRANCH" >/dev/null 2>&1; then
  echo "원격에 브랜치가 없어 push 합니다."
  git push -u origin HEAD
fi

# 2. 변경사항 분석 (main과 비교)
COMMITS_ONELINE=$(git log "$BASE_REF..HEAD" --oneline 2>/dev/null || true)
COMMITS_FULL=$(git log "$BASE_REF..HEAD" 2>/dev/null || true)
DIFF_STAT=$(git diff "$BASE_REF...HEAD" --stat 2>/dev/null || true)
DIFF_FULL=$(git diff "$BASE_REF...HEAD" 2>/dev/null || true)

if [ -z "$COMMITS_ONELINE" ]; then
  echo "main과 비교해 새 커밋이 없습니다. PR을 생성하지 않습니다."
  exit 0
fi

# 이미 PR 있는지 확인
EXISTING_URL=$(gh pr list --head "$BRANCH" --base "$BASE" --json url -q '.[0].url' 2>/dev/null || true)
if [ -n "$EXISTING_URL" ]; then
  echo "이미 PR이 있습니다: $EXISTING_URL"
  exit 0
fi

# 3. PR 제목 생성 (커밋 공통 주제, 타입 prefix, 50자 이내)
# 첫 커밋의 제목에서 타입(feat/fix/docs/refactor 등) 추출 또는 기본값 사용
FIRST_SUBJECT=$(git log "$BASE_REF..HEAD" -1 --format=%s)
if echo "$FIRST_SUBJECT" | grep -qE '^(feat|fix|docs|refactor|chore|style|test|perf)(\([^)]+\))?!?:'; then
  PREFIX=$(echo "$FIRST_SUBJECT" | sed -nE 's/^((feat|fix|docs|refactor|chore|style|test|perf)(\([^)]+\))?!?:).*/\1/p')
  REST=$(echo "$FIRST_SUBJECT" | sed -nE 's/^(feat|fix|docs|refactor|chore|style|test|perf)(\([^)]+\))?!?: *//p')
else
  PREFIX="chore:"
  REST="$FIRST_SUBJECT"
fi
# 50자 이내로 자르기 (prefix + 공백 + 요약)
TITLE="${PREFIX} ${REST}"
if [ ${#TITLE} -gt 50 ]; then
  TITLE="${TITLE:0:47}..."
fi

# 4. PR 본문 생성
COMMITS_SECTION=$(git log "$BASE_REF..HEAD" --format="- \`%h\` %s" | head -50)

# Summary: 커밋 메시지 요약 3–5개
SUMMARY_BULLETS=$(echo "$COMMITS_ONELINE" | head -5 | while read -r _ rest; do echo "- ${rest}"; done)

# Changes: diff --stat 기준으로 카테고리화 (디렉터리/파일 확장자 그룹)
declare -A CATEGORIES
while IFS= read -r line; do
  [ -z "$line" ] && continue
  if [[ "$line" =~ ^[[:space:]]*[0-9]+[[:space:]]+files?[[:space:]]+changed ]]; then continue; fi
  file=$(echo "$line" | awk '{print $1}')
  [ -z "$file" ] && continue
  if [[ "$file" == *"/"* ]]; then
    cat="${file%%/*}"
  else
    cat="${file##*.}"
    [ "$cat" = "$file" ] && cat="root"
  fi
  CATEGORIES["$cat"]="${CATEGORIES["$cat"]:+${CATEGORIES["$cat"]}"$'\n'"}  - \`$file\`"
done < <(echo "$DIFF_STAT")

CHANGES_SECTION=""
for cat in $(echo "${!CATEGORIES[@]}" | tr ' ' '\n' | sort); do
  CHANGES_SECTION="${CHANGES_SECTION}### ${cat}"$'\n'"${CATEGORIES[$cat]}"$'\n\n'
done
[ -z "$CHANGES_SECTION" ] && CHANGES_SECTION="### 변경 파일"$'\n\n'"${DIFF_STAT}"$'\n\n'

BODY=$(cat <<PRBODY
## Summary

\`\`\`
description: "현재 브랜치의 변경사항을 분석하여 PR 생성"
allowed-tools: Bash(git:*), Bash(gh:*)
\`\`\`

현재 브랜치의 모든 커밋을 분석하여 상세한 PR을 생성합니다.

${SUMMARY_BULLETS}

## Changes

${CHANGES_SECTION}## Commits

${COMMITS_SECTION}

## Test Plan

- [ ] 로컬에서 빌드 및 실행 확인
- [ ] 린트/타입 검사 통과
- [ ] 변경 범위에 맞는 수동 테스트

🤖 Generated with [Claude Code](https://claude.com/claude-code)
PRBODY
)

# 5. PR 생성
# 본문에 이스케이프/따옴표 문제 없도록 임시 파일 사용
BODY_FILE=$(mktemp)
trap 'rm -f "$BODY_FILE"' EXIT
printf '%s' "$BODY" > "$BODY_FILE"

echo "PR 제목: $TITLE"
gh pr create --base "$BASE" --title "$TITLE" --body-file "$BODY_FILE"
PR_URL=$(gh pr list --head "$BRANCH" --base "$BASE" --json url -q '.[0].url')
echo "생성된 PR: $PR_URL"
