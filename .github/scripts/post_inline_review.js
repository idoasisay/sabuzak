/**
 * 인라인 코드 리뷰 댓글 작성 스크립트
 * GitHub Actions에서 사용
 */
/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = async function postInlineReviewComments(github, context, core) {
  const fs = require("fs");

  const prNumber = context.payload.pull_request?.number;
  if (!prNumber) {
    core.setFailed("PR 번호를 찾을 수 없습니다.");
    return;
  }

  // 인라인 댓글 정보 읽기
  let inlineComments = [];
  try {
    const commentsData = fs.readFileSync("review_comments.json", "utf8");
    inlineComments = JSON.parse(commentsData);
  } catch (e) {
    core.warning("review_comments.json 파일을 읽을 수 없습니다: " + e.message);
    return;
  }

  if (inlineComments.length === 0) {
    core.info("인라인 댓글이 없습니다.");
    return;
  }

  // PR 정보 가져오기
  const { data: prData } = await github.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prNumber,
  });

  const commitSha = prData.head.sha;

  const { data: files } = await github.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prNumber,
  });

  // 파일별 변경 라인 매핑 생성 (diff 파싱)
  const fileLineMap = {};
  for (const file of files) {
    if (file.status === "modified" || file.status === "added") {
      const patch = file.patch || "";
      const lines = patch.split("\n");

      fileLineMap[file.filename] = {
        additions: [],
      };

      let currentNewLine = null;

      for (const line of lines) {
        // Hunk 헤더: @@ -old_start,old_count +new_start,new_count @@
        if (line.startsWith("@@")) {
          const match = line.match(/\+(\d+)(?:,(\d+))?/);
          if (match) {
            currentNewLine = parseInt(match[1]);
          }
        }
        // 파일 헤더: --- a/file.tsx 또는 +++ b/file.tsx (무시)
        else if (line.startsWith("---") || line.startsWith("+++")) {
          continue;
        }
        // 추가된 라인: +로 시작 (+++ 제외)
        else if (line.startsWith("+")) {
          if (currentNewLine !== null) {
            fileLineMap[file.filename].additions.push(currentNewLine);
            currentNewLine++;
          }
        }
        // 삭제된 라인: -로 시작 (--- 제외) - 새 파일에서는 라인 번호 증가 안 함
        else if (line.startsWith("-")) {
          // 삭제된 라인은 새 파일 라인 번호에 영향 없음
        }
        // 컨텍스트 라인: 공백으로 시작 - 새 파일에서도 존재하므로 라인 번호 증가
        else if (line.startsWith(" ")) {
          if (currentNewLine !== null) {
            currentNewLine++;
          }
        }
        // 특수 라인: \로 시작 (예: \ No newline at end of file) - 무시
        else if (line.startsWith("\\")) {
          // 특수 라인은 무시
        }
      }
    }
  }

  // Review에 포함할 댓글들 준비
  const reviewComments = [];

  for (const comment of inlineComments) {
    try {
      const filePath = comment.path;
      const targetLine = comment.line;

      const fileInfo = fileLineMap[filePath];
      if (!fileInfo || fileInfo.additions.length === 0) {
        core.warning(`파일 ${filePath}의 변경 라인을 찾을 수 없습니다.`);
        continue;
      }

      // 가장 가까운 변경된 라인 찾기
      let closestLine = fileInfo.additions[0];
      let minDiff = Math.abs(fileInfo.additions[0] - targetLine);
      for (const line of fileInfo.additions) {
        const diff = Math.abs(line - targetLine);
        if (diff < minDiff) {
          minDiff = diff;
          closestLine = line;
        }
      }

      const finalLine = fileInfo.additions.includes(targetLine) ? targetLine : closestLine;

      const severityEmoji =
        {
          critical: "🚨",
          suggestion: "💡",
          nitpick: "✏️",
        }[comment.severity] || "💡";

      const commentBody = `${severityEmoji} **[${comment.severity.toUpperCase()}]**\n\n${comment.body}`;

      reviewComments.push({
        path: filePath,
        line: finalLine,
        body: commentBody,
      });

      core.info(`✅ 인라인 댓글 준비: ${filePath}:${finalLine} (요청: ${targetLine})`);
    } catch (error) {
      core.warning(`인라인 댓글 준비 실패 (${comment.path}:${comment.line}): ${error.message}`);
    }
  }

  // Review 생성 및 댓글 추가
  if (reviewComments.length > 0) {
    try {
      const hasCritical = inlineComments.some(c => c.severity === "critical");
      const reviewEvent = hasCritical ? "REQUEST_CHANGES" : "COMMENT";

      let reviewBody = "";
      try {
        reviewBody = fs.readFileSync("review_comment.txt", "utf8");
      } catch {
        reviewBody = `🤖 AI 코드 리뷰가 ${reviewComments.length}개의 인라인 댓글을 작성했습니다.`;
      }

      const { data: review } = await github.rest.pulls.createReview({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: prNumber,
        commit_id: commitSha,
        event: reviewEvent,
        body: reviewBody,
        comments: reviewComments.map(c => ({
          path: c.path,
          line: c.line,
          body: c.body,
        })),
      });

      core.info(`✅ Review 생성 완료 (ID: ${review.id}, 이벤트: ${reviewEvent})`);
      core.info(`✅ 총 ${reviewComments.length}개의 인라인 댓글이 Review에 추가되었습니다.`);
    } catch (error) {
      core.error(`Review 생성 실패: ${error.message}`);
      if (error.response) {
        core.error(`응답: ${JSON.stringify(error.response.data)}`);
      }
      // Fallback: 개별 댓글 작성 시도
      core.info("개별 댓글 작성으로 Fallback 시도...");
      for (const comment of reviewComments) {
        try {
          await github.rest.pulls.createReviewComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
            body: comment.body,
            commit_id: commitSha,
            path: comment.path,
            line: comment.line,
            side: "RIGHT",
          });
        } catch (err) {
          core.warning(`개별 댓글 작성 실패: ${err.message}`);
        }
      }
    }
  } else {
    core.info("인라인 댓글이 없어 Review를 생성하지 않습니다.");
  }
};
