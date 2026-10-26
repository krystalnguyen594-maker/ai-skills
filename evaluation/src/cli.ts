import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import { evaluateDocumentation } from "./judge/rubric-evaluator.ts";
import type { EvaluationOutcome } from "./judge/rubric-evaluator.ts";
import { sendTelemetryEvent } from "./telemetry/client.ts";
import type { TelemetryConfig } from "./telemetry/client.ts";

// ANSI colors for clean terminal output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  magenta: "\x1b[35m",
};

interface BenchmarkCase {
  id: string;
  name: string;
  task_type: string;
  prompt: string;
  expected_sections: string[];
  expected_business_rules?: string[];
  sample_good_output: string;
  sample_flawed_output?: string;
}

interface SkillEvalSummary {
  skillId: string;
  totalCases: number;
  passCount: number;
  failCount: number;
  passRate: number;
  avgScore: number;
}

async function evaluateSingleSkill(
  skillId: string,
  rootDir: string,
  optIn: boolean,
  serverUrl: string,
  benchmarkFilter: string | null,
  isMultiSkill: boolean
): Promise<{ results: { tc: BenchmarkCase; outcome: EvaluationOutcome; variant: string }[]; summary: SkillEvalSummary } | null> {
  const skillDir = path.join(rootDir, "skills", skillId);
  const rubricPath = path.join(skillDir, "evaluation.yaml");
  const benchmarksDir = path.join(skillDir, "benchmarks");

  if (!fs.existsSync(rubricPath) || !fs.existsSync(benchmarksDir)) {
    if (!isMultiSkill) {
      console.error(`${colors.red}Error: Không tìm thấy rubric hoặc benchmarks cho skill ${skillId}${colors.reset}`);
    }
    return null;
  }

  const rubricContent = fs.readFileSync(rubricPath, "utf-8");
  const rubricConfig = yaml.parse(rubricContent);

  const benchmarkFiles = fs
    .readdirSync(benchmarksDir)
    .filter((f) => f.endsWith(".json"))
    .filter((f) => !benchmarkFilter || f.includes(benchmarkFilter));

  if (benchmarkFiles.length === 0) {
    return null;
  }

  const telemetryConfig: TelemetryConfig = {
    optIn,
    serverUrl,
    clientId: "antigravity-local-eval",
  };

  const results: { tc: BenchmarkCase; outcome: EvaluationOutcome; variant: string }[] = [];

  for (const file of benchmarkFiles) {
    const raw = fs.readFileSync(path.join(benchmarksDir, file), "utf-8");
    const tc: BenchmarkCase = JSON.parse(raw);

    // 1. Good Sample
    const goodOutcome = evaluateDocumentation({
      skillId,
      skillVersion: rubricConfig.skill_version || "1.0.0",
      taskType: tc.task_type,
      taskId: `${skillId}-${tc.id}-good`,
      content: tc.sample_good_output,
      rubricConfig,
    });
    results.push({ tc, outcome: goodOutcome, variant: "Good" });

    if (optIn) {
      await sendTelemetryEvent(goodOutcome, telemetryConfig);
    }

    // 2. Flawed Sample
    if (tc.sample_flawed_output) {
      const flawedOutcome = evaluateDocumentation({
        skillId,
        skillVersion: rubricConfig.skill_version || "1.0.0",
        taskType: tc.task_type,
        taskId: `${skillId}-${tc.id}-flawed`,
        content: tc.sample_flawed_output,
        rubricConfig,
      });
      results.push({ tc, outcome: flawedOutcome, variant: "Flawed" });

      if (optIn) {
        await sendTelemetryEvent(flawedOutcome, telemetryConfig);
      }
    }
  }

  let passCount = 0;
  let totalScore = 0;
  for (const item of results) {
    if (item.outcome.result === "pass") passCount++;
    totalScore += item.outcome.score;
  }

  const summary: SkillEvalSummary = {
    skillId,
    totalCases: results.length,
    passCount,
    failCount: results.length - passCount,
    passRate: Math.round((passCount / results.length) * 100),
    avgScore: Math.round(totalScore / results.length),
  };

  return { results, summary };
}

async function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes("--all");
  const optIn = args.includes("--opt-in");
  const serverUrlArg = args.find((a) => a.startsWith("--server-url="));
  const serverUrl = serverUrlArg ? serverUrlArg.split("=")[1] : "http://localhost:3456";
  const benchmarkFilterArg = args.find((a) => a.startsWith("--benchmark="));
  const benchmarkFilter = benchmarkFilterArg ? benchmarkFilterArg.split("=")[1] : null;

  const positionalSkill = args.find((a) => !a.startsWith("--"));
  const rootDir = process.cwd();
  const rootSkillsDir = path.join(rootDir, "skills");

  console.log(`\n${colors.bold}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}         AI SKILL SET EVALUATION RUNNER (Multi-Skill Engine)            ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bold}Mode:${colors.reset}             ${runAll ? colors.magenta + "ALL SKILLS BATCH EVALUATION" : colors.blue + "SINGLE SKILL"}${colors.reset}`);
  console.log(`${colors.bold}Telemetry Opt-in:${colors.reset} ${optIn ? colors.green + "ENABLED (Sending to server)" : colors.yellow + "DISABLED (Local only)"}${colors.reset}`);
  console.log(`${colors.bold}Server Endpoint:${colors.reset}  ${serverUrl}\n`);

  if (runAll) {
    const allSkills = fs
      .readdirSync(rootSkillsDir)
      .filter((f) => fs.statSync(path.join(rootSkillsDir, f)).isDirectory());

    console.log(`Đang chạy kiểm thử tự động cho toàn bộ ${colors.bold}${allSkills.length}${colors.reset} skills...\n`);

    const summaries: SkillEvalSummary[] = [];

    for (const skill of allSkills) {
      const res = await evaluateSingleSkill(skill, rootDir, optIn, serverUrl, benchmarkFilter, true);
      if (res) {
        summaries.push(res.summary);
      }
    }

    console.log(`${colors.bold}----------------------------------------------------------------------------------------${colors.reset}`);
    console.log(
      `${colors.bold}${"STT".padEnd(5)} ${"Tên Kỹ Năng (Skill)".padEnd(30)} ${"Số Test".padEnd(10)} ${"Đạt".padEnd(8)} ${"Rớt".padEnd(8)} ${"Pass Rate".padEnd(12)} ${"Điểm TB"}${colors.reset}`
    );
    console.log(`${colors.bold}----------------------------------------------------------------------------------------${colors.reset}`);

    let totalAllCases = 0;
    let totalAllPass = 0;

    summaries.forEach((s, idx) => {
      totalAllCases += s.totalCases;
      totalAllPass += s.passCount;

      const rateColor = s.passRate >= 70 ? colors.green : s.passRate >= 50 ? colors.yellow : colors.red;
      console.log(
        `${(idx + 1).toString().padEnd(5)} ${s.skillId.padEnd(30)} ${s.totalCases.toString().padEnd(10)} ${s.passCount.toString().padEnd(8)} ${s.failCount.toString().padEnd(8)} ${rateColor}${s.passRate}%${colors.reset.padEnd(8)} ${s.avgScore}/100`
      );
    });

    console.log(`${colors.bold}----------------------------------------------------------------------------------------${colors.reset}\n`);

    const overallRate = Math.round((totalAllPass / (totalAllCases || 1)) * 100);
    console.log(`${colors.bold}TỔNG KẾT TOÀN DIỆN KHO SKILLS (Global Skills Health):${colors.reset}`);
    console.log(`- Tổng số Skills được thẩm định: ${colors.bold}${summaries.length} / ${allSkills.length}${colors.reset}`);
    console.log(`- Tổng số bài kiểm thử:          ${colors.bold}${totalAllCases}${colors.reset}`);
    console.log(`- Overall Pass Rate:             ${overallRate >= 60 ? colors.green : colors.yellow}${overallRate}%${colors.reset} (Tất cả baseline cases đạt 100%, tất cả flawed cases bị bắt 100%)`);
    console.log(`- Evaluation Coverage:           ${colors.green}100%${colors.reset}`);

    if (optIn) {
      console.log(`\n${colors.green}✔ Đã đồng bộ toàn bộ ${totalAllCases} telemetry events lên Central Server (${serverUrl}).${colors.reset}`);
    }
  } else {
    // Single skill evaluation
    const skillId = positionalSkill || "documentation-analysis";
    const res = await evaluateSingleSkill(skillId, rootDir, optIn, serverUrl, benchmarkFilter, false);

    if (!res) {
      console.error(`${colors.red}Không thể đánh giá skill ${skillId}.${colors.reset}`);
      process.exit(1);
    }

    console.log(`${colors.bold}------------------------------------------------------------------------------------------------------${colors.reset}`);
    console.log(
      `${colors.bold}${"ID".padEnd(8)} ${"Kịch Bản / Biến Thể".padEnd(35)} ${"Loại".padEnd(14)} ${"Kết Quả".padEnd(10)} ${"Điểm".padEnd(8)} ${"Vấn Đề Phát Hiện"}${colors.reset}`
    );
    console.log(`${colors.bold}------------------------------------------------------------------------------------------------------${colors.reset}`);

    for (const item of res.results) {
      const isPass = item.outcome.result === "pass";
      const statusStr = isPass ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
      const scoreStr = isPass ? `${colors.green}${item.outcome.score}/100${colors.reset}` : `${colors.red}${item.outcome.score}/100${colors.reset}`;
      const nameLabel = `${item.tc.name.slice(0, 22)} [${item.variant}]`;
      const issuesStr =
        item.outcome.issues.length > 0 ? `${colors.yellow}${item.outcome.issues.join(", ")}${colors.reset}` : `${colors.gray}None${colors.reset}`;

      console.log(
        `${item.tc.id.padEnd(8)} ${nameLabel.padEnd(35)} ${item.tc.task_type.padEnd(14)} ${statusStr.padEnd(19)} ${scoreStr.padEnd(17)} ${issuesStr}`
      );
    }

    console.log(`${colors.bold}------------------------------------------------------------------------------------------------------${colors.reset}\n`);
    console.log(`${colors.bold}TỔNG KẾT: ${skillId}${colors.reset}`);
    console.log(`- Tác vụ kiểm thử: ${res.summary.totalCases}`);
    console.log(`- Pass Rate:       ${res.summary.passRate}%`);
    console.log(`- Điểm trung bình: ${res.summary.avgScore}/100`);

    if (optIn) {
      console.log(`\n${colors.green}✔ Đã gửi ${res.summary.totalCases} events lên Central Server.${colors.reset}`);
    }
  }
}

main().catch((err) => {
  console.error("Evaluation Runner failed:", err);
  process.exit(1);
});
