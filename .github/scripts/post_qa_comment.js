/**
 * QA 시나리오 댓글 작성 스크립트
 * GitHub Actions에서 사용
 */
/* eslint-disable @typescript-eslint/no-require-imports */
module.exports = async function postQAComment(github, context, core) {
  const fs = require("fs");

  const prNumber = context.payload.pull_request?.number || context.issue?.number;
  if (!prNumber) {
    core.setFailed("PR 번호를 찾을 수 없습니다.");
    return;
  }

  let comment = "";
  try {
    comment = fs.readFileSync("qa_comment.txt", "utf8");
  } catch (e) {
    core.error(`qa_comment.txt 파일을 읽을 수 없습니다: ${e.message}`);
    core.setFailed("QA 시나리오 댓글 파일을 읽는 중 오류가 발생했습니다.");
    return;
  }

  if (!comment || comment.trim().length === 0) {
    core.warning("qa_comment.txt 파일이 비어있습니다. 댓글을 작성하지 않습니다.");
    return;
  }

  try {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
      body: comment,
    });

    core.info("✅ QA 시나리오 댓글 작성 완료");
  } catch (error) {
    core.error(`PR 댓글 작성 실패: ${error.message}`);
    core.setFailed("QA 시나리오 댓글 작성 중 오류가 발생했습니다.");
  }
};
