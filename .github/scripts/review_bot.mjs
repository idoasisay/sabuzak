/**
 * 코드 리뷰 생성 봇 (Node.js)
 * GitHub Actions에서 PR diff를 분석하여 코드 리뷰를 생성하고 인라인 댓글용 파일을 출력합니다.
 */
import { createInterface } from "node:readline";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..", "..");

function getPrDiff() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      try {
        const out = execSync("git diff origin/main...HEAD", {
          encoding: "utf-8",
          cwd: rootDir,
        });
        resolve(out || "");
      } catch (e) {
        console.error("Error: git diff 실행 실패:", e.message);
        process.exit(1);
      }
      return;
    }
    const chunks = [];
    const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
    rl.on("line", (line) => chunks.push(line + "\n"));
    rl.on("close", () => resolve(chunks.join("")));
  });
}

function countChangedFiles(diff) {
  const filePattern = /^diff --git.*\n.*\n^--- a\/(.+)$/gm;
  const files = new Set();
  let m;
  while ((m = filePattern.exec(diff)) !== null) files.add(m[1]);
  return files.size;
}

function getProjectStack() {
  const paths = [
    join(rootDir, "package.json"),
    join(__dirname, "..", "package.json"),
  ];
  const keys = ["next", "react", "react-dom", "typescript", "tailwindcss", "eslint"];
  for (const p of paths) {
    try {
      const raw = readFileSync(p, "utf-8");
      const pkg = JSON.parse(raw);
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      const parts = keys
        .filter((k) => deps[k])
        .map((k) => `${k} ${String(deps[k]).replace(/^[\^~]?/, "").split("-")[0]}`);
      if (parts.length) return parts.join(", ");
    } catch {
      continue;
    }
  }
  return "";
}

function createPrompt(prDiff, projectStack = "") {
  const systemPrompt = `당신은 10년 이상의 경력을 가진 시니어 코드 리뷰어입니다. Pull Request의 코드 변경사항을 깊이 있게 분석하여 실용적이고 구체적인 리뷰를 작성합니다.

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
- "혹시 모르니까" 하는 식의 과잉 경고는 suggestion으로 분류할 것.

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
- **모든 내용은 반드시 한국어로 작성**`;

  const stackSection = projectStack
    ? `\n**프로젝트 스택 (위 버전 기준으로만 제안할 것):** ${projectStack}\n\n`
    : "";
  const userPrompt = `다음 Pull Request의 코드 변경사항을 상세히 분석하고 리뷰해주세요.
${stackSection}**코드 변경사항:**
${prDiff}

**리뷰 요청사항:**
1. 확실한 버그/보안/데이터 이슈가 있을 때만 critical로 지적 (의심 수준이면 suggestion)
2. 각 코멘트는 구체적인 문제 설명과 개선 방안을 포함
3. 코드의 맥락을 고려하여 실용적인 제안 제공
4. 과도한 코멘트보다는 중요한 이슈에 집중
5. 제안 시 반드시 프로젝트 스택에 적힌 버전(예: Next.js 16, React 19)의 최신 문서·패턴만 사용할 것. 구버전(Next 15 등) 기준 권장 금지.

위 형식에 맞춰 JSON으로 코드 리뷰를 제공해주세요. 응답은 반드시 유효한 JSON 형식이어야 하며, 마크다운 코드블록 없이 순수 JSON만 반환해주세요.`;

  return { systemPrompt, userPrompt };
}

function parseJsonResponse(content) {
  let s = content.trim();
  if (s.startsWith("```")) {
    const lines = s.split("\n");
    let start = 0;
    let end = lines.length;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("```")) {
        if (i === 0) start = 1;
        else {
          end = i;
          break;
        }
      }
    }
    s = lines.slice(start, end).join("\n");
  }
  try {
    return JSON.parse(s);
  } catch {
    const match = s.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fallthrough
      }
    }
  }
  return { summary: "코드 리뷰 파싱 실패", comments: [] };
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const prDiff = await getPrDiff();
  if (!prDiff.trim()) {
    console.error("Warning: PR diff가 비어있습니다.");
    process.exit(0);
  }

  const filesCount = countChangedFiles(prDiff);
  const projectStack = getProjectStack();
  const { systemPrompt, userPrompt } = createPrompt(prDiff, projectStack);
  const combined = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: combined,
    });

    const resultText = response?.text ?? String(response ?? "");
    const reviewData = parseJsonResponse(resultText);
    const comments = reviewData.comments || [];

    writeFileSync(
      join(rootDir, "review_comments.json"),
      JSON.stringify(comments, null, 2),
      "utf-8"
    );

    const summaryLines = [
      "[ AI 코드 리뷰 ]",
      "",
      `**요약:** ${reviewData.summary ?? "코드 리뷰 완료"}`,
      "",
      "**리뷰 통계**",
      `[ 즉시 수정 필요 ]: ${comments.filter((c) => c.severity === "critical").length}`,
      `[ 개선 권장 ]: ${comments.filter((c) => c.severity === "suggestion").length}`,
      `[ 사소한 개선 ]: ${comments.filter((c) => c.severity === "nitpick").length}`,
    ];

    if (comments.length > 0) {
      summaryLines.push("", "<details>", "<summary>상세 코멘트 보기</summary>", "");
      const byPath = {};
      for (const c of comments) {
        const p = c.path || "unknown";
        if (!byPath[p]) byPath[p] = [];
        byPath[p].push(c);
      }
      for (const [path, fileComments] of Object.entries(byPath)) {
        summaryLines.push(`### \`${path}\``, "");
        for (const c of fileComments) {
          const sev = c.severity || "suggestion";
          const label =
            { critical: "[ 즉시 수정 필요 ]", suggestion: "[ 개선 권장 ]", nitpick: "[ 사소한 개선 ]" }[
              sev
            ] || "[ 개선 권장 ]";
          summaryLines.push(`**${label} [${sev.toUpperCase()}]** 라인 ${c.line ?? 0}:`, c.body ?? "", "");
        }
      }
      summaryLines.push("</details>");
    }
    summaryLines.push("", `📈 분석 파일: ${filesCount}개`);

    writeFileSync(join(rootDir, "review_comment.txt"), summaryLines.join("\n"), "utf-8");
  } catch (e) {
    console.error("Error: 코드 리뷰 생성 실패:", e.message);
    if (e.stack) console.error(e.stack);
    process.exit(1);
  }
}

main();
