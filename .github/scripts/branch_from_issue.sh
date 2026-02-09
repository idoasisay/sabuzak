#!/usr/bin/env bash
# 이슈 번호로 브랜치 생성 (main 기준)
# 사용: ./branch_from_issue.sh 123
# 결과: issue-123-이슈제목-url-safe 형태의 브랜치

set -e
ISSUE_NUM="${1:?이슈 번호를 넣어주세요. 예: ./branch_from_issue.sh 123}"

if ! command -v gh &>/dev/null; then
  echo "GitHub CLI(gh)가 필요합니다. 설치: brew install gh"
  exit 1
fi

BASE="${BASE:-main}"
git fetch origin "$BASE" 2>/dev/null || true
git checkout -q "$BASE"
git pull origin "$BASE" 2>/dev/null || true

# 이슈 제목 가져오기 (없으면 번호만 사용)
TITLE=$(gh issue view "$ISSUE_NUM" --json title -q '.title' 2>/dev/null) || TITLE=""
# 브랜치 이름: 공백·특수문자 → 하이픈, 길이 제한
SAFE=$(echo "$TITLE" | sed 's/  */ /g' | tr ' ' '-' | tr -cd '[:alnum:]\-_가-힣' | cut -c1-50)
if [ -z "$SAFE" ]; then
  BRANCH="issue-${ISSUE_NUM}"
else
  BRANCH="issue-${ISSUE_NUM}-${SAFE}"
fi

git checkout -b "$BRANCH"
echo "브랜치 생성됨: $BRANCH (이슈 #$ISSUE_NUM)"
echo "푸시: git push -u origin $BRANCH"
