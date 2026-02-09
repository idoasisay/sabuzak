/**
 * PR 생성/갱신: Gemini가 제목·본문 생성 → gh로 create/edit
 * 사용: node .github/scripts/pr_create.mjs (repo root에서, GEMINI_API_KEY·GH_TOKEN 필요)
 */
import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..", "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: "utf-8", cwd: rootDir, ...opts }).trim();
}

function runOptional(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", cwd: rootDir }).trim();
  } catch {
    return "";
  }
}

async function main() {
  const BASE = "main";
  const BASE_REF = "origin/main";

  console.log("::group::브랜치 정보");
  runOptional("git fetch origin " + BASE);
  const branch = run("git branch --show-current");
  console.log("현재 브랜치:", branch);
  console.log("base:", BASE);
  console.log("::endgroup::");

  try {
    run("git rev-parse --verify origin/" + branch, { stdio: "pipe" });
  } catch {
    console.log("원격에 브랜치가 없어 push 합니다.");
    run("git push -u origin HEAD");
  }

  const commitsOneline = runOptional(`git log ${BASE_REF}..HEAD --oneline`);
  if (!commitsOneline) {
    console.log("main과 비교해 새 커밋이 없습니다. PR을 생성하지 않습니다.");
    process.exit(0);
  }

  const commitsFormatted = runOptional(
    "git log " + BASE_REF + "..HEAD --format='- `%h` %s'"
  );
  const diffStat = runOptional(`git diff ${BASE_REF}...HEAD --stat`);
  const diffSample = runOptional(`git diff ${BASE_REF}...HEAD`).slice(0, 24000);

  let existingNumber = null;
  let existingUrl = null;
  try {
    const list = run(`gh pr list --head ${branch} --base ${BASE} --json number,url`);
    const arr = JSON.parse(list);
    if (arr && arr[0]) {
      existingNumber = arr[0].number;
      existingUrl = arr[0].url;
    }
  } catch {
    // no existing PR
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const systemPrompt = `당신은 Pull Request 제목과 본문을 작성하는 보조 역할입니다.
다음 규칙으로 **JSON만** 출력하세요. 마크다운 코드블록 없이 순수 JSON만 반환합니다.

**출력 형식:**
{"title":"...","body":"..."}

**title 규칙:**
- feat / fix / docs / refactor / chore / style / test / perf 중 하나로 시작
- 커밋들의 공통 주제 파악, 50자 이내 핵심 요약

**body 규칙 (반드시 이 순서·형식):**
본문 맨 위에 아래 블록을 넣고, 이어서 Summary/Changes/Commits/Test Plan을 작성하세요.

---
description: "현재 브랜치의 변경사항을 분석하여 PR 생성"
allowed-tools: Bash(git:*), Bash(gh:*)
---

현재 브랜치의 모든 커밋을 분석하여 상세한 PR을 생성합니다.

## Summary

- 주요 변경사항 3-5개 bullet point
- 각 커밋의 핵심 내용 포함

## Changes

### [카테고리 1]
- 세부 변경사항

### [카테고리 2]
- 세부 변경사항

## Commits

- \`abc1234\` feat: 커밋 메시지 1
- \`def5678\` fix: 커밋 메시지 2

(위 Commits는 제공된 커밋 목록을 그대로 넣기)

## Test Plan

- [ ] 테스트 항목 1
- [ ] 테스트 항목 2


**언어:** 제목·본문 모두 한국어.`;

  const userPrompt = `다음 브랜치 "${branch}"의 main 대비 변경사항을 바탕으로 PR 제목(title)과 본문(body)을 생성해주세요.

**커밋 목록:**
${commitsFormatted}

**변경 파일 요약 (diff --stat):**
${diffStat}

**코드 diff (일부):**
\`\`\`
${diffSample}
\`\`\`

위 형식의 JSON만 출력하세요.`;

  let title = "";
  let body = "";

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: { parts: [{ text: systemPrompt }] },
      },
    });

    const text =
      response?.text ??
      response?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        .filter(Boolean)
        .join("") ??
      "";
    let raw = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    function fixControlCharsInStrings(s) {
      let out = "";
      let i = 0;
      let inStr = false;
      let escape = false;
      while (i < s.length) {
        const c = s[i];
        if (escape) {
          out += c;
          escape = false;
          i++;
          continue;
        }
        if (c === "\\" && inStr) {
          escape = true;
          out += c;
          i++;
          continue;
        }
        if (c === '"') {
          inStr = !inStr;
          out += c;
          i++;
          continue;
        }
        if (inStr && (c === "\n" || c === "\r")) {
          out += "\\n";
          i++;
          continue;
        }
        out += c;
        i++;
      }
      return out;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      if (/control character in string literal/i.test(parseErr.message)) {
        raw = fixControlCharsInStrings(raw);
        parsed = JSON.parse(raw);
      } else {
        throw parseErr;
      }
    }
    title = String(parsed.title || "").slice(0, 80);
    body = String(parsed.body || "");

    // 브랜치 이름이 issue-N 형태면 PR 본문에 Fixes #N 추가 (이슈·프로젝트 연동)
    const issueMatch = branch.match(/^issue-(\d+)(?:-|$)/);
    if (issueMatch) {
      const issueNum = issueMatch[1];
      const fixesLine = `\n\nFixes #${issueNum}`;
      if (!body.includes(`#${issueNum}`)) body += fixesLine;
    }
  } catch (e) {
    console.error("Error: Gemini PR 내용 생성 실패:", e.message);
    process.exit(1);
  }

  if (!title) {
    console.error("Error: 제목이 비어 있습니다.");
    process.exit(1);
  }

  const tmpBody = join(rootDir, "pr_body_temp.txt");
  writeFileSync(tmpBody, body, "utf-8");

  try {
    console.log("PR 제목:", title);
    if (existingNumber != null) {
      run(`gh pr edit ${existingNumber} --title ${JSON.stringify(title)} --body-file ${tmpBody}`);
      console.log("기존 PR 본문/제목 갱신:", existingUrl);
    } else {
      run(`gh pr create --base ${BASE} --title ${JSON.stringify(title)} --body-file ${tmpBody}`);
      const list = run(`gh pr list --head ${branch} --base ${BASE} --json url -q '.[0].url'`);
      console.log("생성된 PR:", list || "(확인 필요)");
    }
  } finally {
    try {
      unlinkSync(tmpBody);
    } catch {
      // ignore
    }
  }
}

main();
