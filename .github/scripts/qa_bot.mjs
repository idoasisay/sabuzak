/**
 * QA 테스트 시나리오 생성 봇 (Node.js)
 * GitHub Actions에서 PR diff를 분석하여 테스트 시나리오를 생성합니다.
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

function createPrompt(prDiff) {
  const systemPrompt = `당신은 전문 프론트엔드 QA 엔지니어입니다. 코드 변경사항을 분석하여 사용자가 UI에서 직접 행동하며 검증해야 할 테스트 시나리오를 작성합니다.

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
- **모든 내용은 반드시 한국어로 작성하세요**`;

  const userPrompt = `다음 코드 변경사항을 분석하고 테스트 시나리오를 추천해주세요.

${prDiff}

**중요**: 
- 컴팩트하게 작성 (빈 줄 최소화)
- 체크박스 사용
- details 태그로 상세 내용 감싸기
- 사용자 행동 중심으로 구체적으로 작성`;

  return { systemPrompt, userPrompt };
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
  const { systemPrompt, userPrompt } = createPrompt(prDiff);
  const combined = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: combined,
    });

    const resultText = response?.text ?? String(response ?? "");
    writeFileSync(join(rootDir, "qa_comment.txt"), resultText, "utf-8");
  } catch (e) {
    console.error("Error: 테스트 시나리오 생성 실패:", e.message);
    if (e.stack) console.error(e.stack);
    process.exit(1);
  }
}

main();
