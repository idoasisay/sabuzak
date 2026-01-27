"""
QA 테스트 시나리오 생성 봇
GitHub Actions에서 PR diff를 분석하여 테스트 시나리오를 생성합니다.
"""
import os
import sys
import subprocess
import re
from google import genai

def get_pr_diff() -> str:
    """PR diff 가져오기 (stdin 또는 git 명령어)"""
    if not sys.stdin.isatty():
        return sys.stdin.read()
    else:
        try:
            result = subprocess.run(
                ["git", "diff", "origin/main...HEAD"],
                capture_output=True,
                text=True,
                encoding="utf-8"
            )
            return result.stdout or ""
        except Exception as e:
            print(f"Error: git diff 실행 실패: {e}", file=sys.stderr)
            sys.exit(1)

def count_changed_files(diff: str) -> int:
    """diff에서 변경된 파일 수 계산"""
    file_pattern = re.compile(r'^diff --git.*\n.*\n^--- a/(.+)$', re.MULTILINE)
    files = set()
    for match in file_pattern.finditer(diff):
        files.add(match.group(1))
    return len(files)

def create_prompt(pr_diff: str) -> tuple[str, str]:
    """시스템 프롬프트와 사용자 프롬프트 생성"""
    system_prompt = """당신은 전문 프론트엔드 QA 엔지니어입니다. 코드 변경사항을 분석하여 사용자가 UI에서 직접 행동하며 검증해야 할 테스트 시나리오를 작성합니다.

**중요:** 
- 기술 용어 대신 사용자 관점의 언어를 사용하세요.
- '클릭', '입력', '스크롤' 등 구체적인 사용자 행동 중심으로 작성하세요.
- 비개발자도 이해할 수 있도록 작성하세요.

**응답 형식 (정확히 따라주세요):**

## 🧪 QA 테스트 시나리오
> **핵심 변경사항**: (한 문장 요약)

### 🔴 높은 우선순위
- [ ] **시나리오명**
<details>
<summary>상세 보기</summary>

**설명:** 무엇을 테스트하는지

**테스트 방법:**
1. 첫 번째 단계 (예: "로그인 버튼 클릭")
2. 두 번째 단계 (예: "이메일 입력 필드에 'test@example.com' 입력")
3. 세 번째 단계 (예: "비밀번호 입력 후 제출 버튼 클릭")

**예상 결과:** (기대하는 동작)

</details>

### 🟡 중간 우선순위
(위와 동일한 형식)

### 🟢 낮은 우선순위
(위와 동일한 형식)

**규칙:**
- 체크박스 줄에는 시나리오명만 (설명 X)
- details 태그는 반드시 새 줄에서 시작
- summary 뒤에 빈 줄 필수
- 테스트 방법은 구체적인 사용자 행동으로 작성
- **모든 내용은 반드시 한국어로 작성하세요**"""

    user_prompt = f"""다음 코드 변경사항을 분석하고 테스트 시나리오를 추천해주세요.

{pr_diff}

**중요**: 
- 컴팩트하게 작성 (빈 줄 최소화)
- 체크박스 사용
- details 태그로 상세 내용 감싸기
- 사용자 행동 중심으로 구체적으로 작성"""

    return system_prompt, user_prompt

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.", file=sys.stderr)
        sys.exit(1)

    pr_diff = get_pr_diff()
    if not pr_diff:
        print("Warning: PR diff가 비어있습니다.", file=sys.stderr)
        sys.exit(0)

    files_count = count_changed_files(pr_diff)

    try:
        client = genai.Client(api_key=api_key)
        system_prompt, user_prompt = create_prompt(pr_diff)
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=combined_prompt
        )
        
        result_text = response.text if hasattr(response, 'text') else str(response)
        
        with open("qa_comment.txt", "w", encoding="utf-8") as f:
            f.write(result_text)
        
        print("✅ QA 테스트 시나리오 생성 완료: qa_comment.txt")
        print(f"📁 변경된 파일 수: {files_count}")
        
        client.close()
        
    except Exception as e:
        print(f"Error: 테스트 시나리오 생성 실패: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
