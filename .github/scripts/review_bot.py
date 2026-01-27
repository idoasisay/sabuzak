"""
코드 리뷰 생성 봇
GitHub Actions에서 PR diff를 분석하여 코드 리뷰를 생성하고 인라인 댓글을 작성합니다.
"""
import os
import sys
import subprocess
import re
import json
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

def get_project_stack() -> str:
    """package.json에서 주요 의존성 버전을 읽어 프로젝트 스택 설명 문자열 반환"""
    pkg_paths = ["package.json", "../package.json"]
    for pkg_path in pkg_paths:
        try:
            with open(pkg_path, encoding="utf-8") as f:
                pkg = json.load(f)
            deps = {**(pkg.get("dependencies") or {}), **(pkg.get("devDependencies") or {})}
            # 주요 항목만 버전 포함해 나열 (^~ 제거해 핵심 버전만)
            keys = ["next", "react", "react-dom", "typescript", "tailwindcss", "eslint"]
            parts = []
            for k in keys:
                v = deps.get(k)
                if v:
                    clean = re.sub(r"^[\^~]?", "", str(v).split("-")[0])
                    parts.append(f"{k} {clean}")
            if parts:
                return ", ".join(parts)
            return ""
        except (OSError, json.JSONDecodeError, KeyError):
            continue
    return ""

def create_prompt(pr_diff: str, project_stack: str = "") -> tuple[str, str]:
    """시스템 프롬프트와 사용자 프롬프트 생성"""
    system_prompt = """당신은 10년 이상의 경력을 가진 시니어 코드 리뷰어입니다. Pull Request의 코드 변경사항을 깊이 있게 분석하여 실용적이고 구체적인 리뷰를 작성합니다.

**핵심 리뷰 포인트 (우선순위 순):**

1. **Critical - 버그 및 잠재적 오류**
   - 논리적 오류, 경계 조건 처리 누락
   - Null/Undefined 참조 가능성, 타입 불일치
   - 예외 처리 누락, 에러 핸들링 부재
   - 메모리 누수, 리소스 해제 누락
   - Race condition, 동시성 문제

2. **보안 취약점**
   - 입력 검증 부족, SQL/NoSQL 인젝션
   - XSS, CSRF, 인증/권한 우회 가능성
   - 민감 정보 노출 (API 키, 비밀번호 등)
   - 암호화/해싱 부적절한 사용

3. **성능 이슈**
   - 비효율적인 알고리즘 (시간 복잡도)
   - 불필요한 반복문, 중복 계산
   - N+1 쿼리 문제, 과도한 데이터베이스 호출
   - 메모리 사용량 과다, 불필요한 객체 생성

4. **코드 품질 및 유지보수성**
   - 가독성: 복잡한 로직, 매직 넘버, 불명확한 변수명
   - 중복 코드 (DRY 원칙 위반)
   - 함수/클래스 크기 과다, 단일 책임 원칙 위반
   - 결합도 높음, 의존성 관리 문제

5. **아키텍처 및 설계**
   - 설계 패턴 부적절한 사용
   - 확장성 고려 부족
   - 인터페이스/추상화 부족

6. **베스트 프랙티스**
   - 언어/프레임워크 권장 패턴 준수 여부
   - 코딩 컨벤션, 스타일 가이드 준수
   - 문서화 부족 (복잡한 로직)

**프로젝트 버전 기준 (필수):**
- 리뷰·제안은 반드시 이 프로젝트가 쓰는 버전의 최신 문서와 API 기준으로 할 것.
- 예: Next.js 16 사용 시 Next.js 15 문법/예제를 권하지 말고, Next.js 16 공식 문서·채택된 패턴만 제안할 것.
- React, TypeScript 등도 diff 또는 아래 "프로젝트 스택"에 적힌 버전 기준으로만 언급할 것.
- 구버전 패턴이나 "Next 15에서는 …" 같은 권장은 하지 말 것.

**Severity 기준 (엄격히 적용):**
- **critical**: 즉시 수정 필요—실제 버그, 확인된 보안 취약점, 데이터 손실·시스템 오류 가능성이 명확할 때만 사용. 애매하면 suggestion으로 내리세요.
- **suggestion**: 개선 권장 (성능, 가독성, 유지보수성, 잠재적 이슈)
- **nitpick**: 사소한 개선 (스타일, 네이밍, 주석)

**Severity 사용 규칙:**
- critical이 진짜 없으면 comments에 critical 한 건도 넣지 말 것.
- “혹시 모르니까” 하는 식의 과잉 경고는 suggestion으로 분류할 것.

**응답 형식 (반드시 JSON으로 응답, 마크다운 코드블록 없이):**
{
  "summary": "전체 리뷰 요약 (1-2문장, 핵심 이슈 강조)",
  "comments": [
    {
      "path": "파일 경로 (정확한 경로)",
      "line": 라인 번호 (숫자만),
      "severity": "critical|suggestion|nitpick",
      "body": "구체적인 문제 설명 + 개선 제안 (한국어, 명확하고 실용적으로)"
    }
  ]
}

**리뷰 작성 규칙:**
- 변경된 코드 라인에만 코멘트 작성
- 라인 번호는 diff에서 보이는 실제 라인 번호 사용
- 각 코멘트는 구체적이고 실행 가능한 제안 포함
- 중요하지 않은 스타일 이슈는 nitpick으로 분류
- Critical은 실제로 있을 때만 사용 (없으면 0개가 정상)
- 과도한 코멘트 지양 (중요한 것에 집중)
- 응답은 반드시 유효한 JSON 형식 (마크다운 코드블록 없이)
- **모든 내용은 반드시 한국어로 작성**"""

    stack_section = ""
    if project_stack:
        stack_section = f"\n**프로젝트 스택 (위 버전 기준으로만 제안할 것):** {project_stack}\n\n"

    user_prompt = f"""다음 Pull Request의 코드 변경사항을 상세히 분석하고 리뷰해주세요.
{stack_section}**코드 변경사항:**
{pr_diff}

**리뷰 요청사항:**
1. 확실한 버그/보안/데이터 이슈가 있을 때만 critical로 지적 (의심 수준이면 suggestion)
2. 각 코멘트는 구체적인 문제 설명과 개선 방안을 포함
3. 코드의 맥락을 고려하여 실용적인 제안 제공
4. 과도한 코멘트보다는 중요한 이슈에 집중
5. 제안 시 반드시 프로젝트 스택에 적힌 버전(예: Next.js 16, React 19)의 최신 문서·패턴만 사용할 것. 구버전(Next 15 등) 기준 권장 금지.

위 형식에 맞춰 JSON으로 코드 리뷰를 제공해주세요. 응답은 반드시 유효한 JSON 형식이어야 하며, 마크다운 코드블록 없이 순수 JSON만 반환해주세요."""

    return system_prompt, user_prompt

def parse_json_response(content: str) -> dict:
    """LLM 응답에서 JSON 추출 및 파싱"""
    content = content.strip()
    
    # 마크다운 코드블록 제거
    if content.startswith('```'):
        lines = content.split('\n')
        start_idx = 0
        end_idx = len(lines)
        for i, line in enumerate(lines):
            if line.startswith('```') and i == 0:
                start_idx = 1
            elif line.startswith('```') and i > 0:
                end_idx = i
                break
        content = '\n'.join(lines[start_idx:end_idx])
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        # JSON 객체 찾기 시도
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # 파싱 실패 시 기본 구조 반환
        return {
            'summary': '코드 리뷰 파싱 실패',
            'comments': []
        }

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
        project_stack = get_project_stack()
        client = genai.Client(api_key=api_key)
        system_prompt, user_prompt = create_prompt(pr_diff, project_stack)
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=combined_prompt
        )
        
        result_text = response.text if hasattr(response, 'text') else str(response)
        
        # JSON 파싱
        review_data = parse_json_response(result_text)
        comments = review_data.get('comments', [])
        
        # 인라인 댓글 정보를 JSON 파일로 저장
        with open("review_comments.json", "w", encoding="utf-8") as f:
            json.dump(comments, f, ensure_ascii=False, indent=2)
        
        # 요약 댓글 생성 (PR 댓글로 사용)
        summary_lines = []
        summary_lines.append('[ AI 코드 리뷰 ]')
        summary_lines.append('')
        summary_lines.append(f'**요약:** {review_data.get("summary", "코드 리뷰 완료")}')
        summary_lines.append('')
        
        critical_count = sum(1 for c in comments if c.get('severity') == 'critical')
        suggestion_count = sum(1 for c in comments if c.get('severity') == 'suggestion')
        nitpick_count = sum(1 for c in comments if c.get('severity') == 'nitpick')
        
        summary_lines.append('**리뷰 통계**')
        summary_lines.append(f'[ 즉시 수정 필요 ]: {critical_count}')
        summary_lines.append(f'[ 개선 권장 ]: {suggestion_count}')
        summary_lines.append(f'[ 사소한 개선 ]: {nitpick_count}')
        
        # 상세 코멘트 보기 (접을 수 있는 섹션)
        if comments:
            summary_lines.append('')
            summary_lines.append('<details>')
            summary_lines.append('<summary>상세 코멘트 보기</summary>')
            summary_lines.append('')
            
            # 파일별로 그룹화
            files_dict = {}
            for comment in comments:
                path = comment.get('path', 'unknown')
                if path not in files_dict:
                    files_dict[path] = []
                files_dict[path].append(comment)
            
            for path, file_comments in files_dict.items():
                summary_lines.append(f'### `{path}`')
                summary_lines.append('')
                for comment in file_comments:
                    severity = comment.get('severity', 'suggestion')
                    line_num = comment.get('line', 0)
                    comment_text = comment.get('body', '')
                    
                    severity_emoji = {
                        'critical': '[ 즉시 수정 필요 ]',
                        'suggestion': '[ 개선 권장 ]',
                        'nitpick': '[ 사소한 개선 ]'
                    }.get(severity, '[ 개선 권장 ]')
                    
                    summary_lines.append(f'**{severity_emoji} [{severity.upper()}]** 라인 {line_num}:')
                    summary_lines.append(f'{comment_text}')
                    summary_lines.append('')
            
            summary_lines.append('</details>')
        
        summary_lines.append('')
        summary_lines.append(f'📈 분석 파일: {files_count}개')
        
        summary_text = '\n'.join(summary_lines)
        
        with open("review_comment.txt", "w", encoding="utf-8") as f:
            f.write(summary_text)
        
        client.close()
        
    except Exception as e:
        print(f"Error: 코드 리뷰 생성 실패: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
