import { checkStructure } from "../rules/structural-check.ts";

export interface EvaluationInput {
  skillId: string;
  skillVersion: string;
  taskType: string;
  taskId: string;
  content: string;
  rubricConfig: any;
}

export interface EvaluationOutcome {
  eventId: string;
  taskId: string;
  skillId: string;
  skillVersion: string;
  taskType: string;
  timestamp: string;
  evaluationStatus: "evaluated" | "not_evaluable";
  result: "pass" | "fail" | "not_evaluable";
  score: number;
  evaluationMethod: "hybrid" | "rule_based" | "rubric";
  issues: string[];
  reworkRequired: boolean;
  dimensionScores: {
    completeness: number;
    businessSoundness: number;
    gherkinAndTraceability: number;
    clarityAndFormat: number;
  };
  feedback: string;
}

/**
 * Generates a pseudo-UUID v4.
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Hybrid Evaluator: Evaluates documentation output against rules and semantic dimensions.
 */
export function evaluateDocumentation(input: EvaluationInput): EvaluationOutcome {
  const { skillId, skillVersion, taskType, taskId, content, rubricConfig } = input;
  const eventId = generateUUID();
  const timestamp = new Date().toISOString();

  // If content is empty or unparsable
  if (!content || content.trim().length < 50) {
    return {
      eventId,
      taskId,
      skillId,
      skillVersion,
      taskType,
      timestamp,
      evaluationStatus: "not_evaluable",
      result: "not_evaluable",
      score: 0,
      evaluationMethod: "hybrid",
      issues: ["content_too_short_or_empty"],
      reworkRequired: true,
      dimensionScores: { completeness: 0, businessSoundness: 0, gherkinAndTraceability: 0, clarityAndFormat: 0 },
      feedback: "Nội dung quá ngắn hoặc rỗng, không thể đánh giá.",
    };
  }

  // 1. Run Structural Check
  const taskConfig = rubricConfig?.task_types?.find((t: any) => t.id === taskType);
  const prohibited = rubricConfig?.prohibited_patterns?.[taskType] || [];
  const structResult = checkStructure(content, taskType, taskConfig, prohibited);

  // 2. Score Semantic Dimensions (Heuristic / Rubric dimensions)
  // Completeness (0-100)
  const completeness = structResult.score;

  // Business Soundness (Phù hợp với từng loại tài liệu)
  let businessSoundness = 90;
  if (taskType === "frd_analysis") {
    const hasValidationMatrix = /validation|error handling|xử lý lỗi|ràng buộc/i.test(content);
    const hasEdgeCases = /timeout|lỗi|thất bại|không đủ|hết lượt/i.test(content);
    if (!hasValidationMatrix) businessSoundness -= 25;
    if (!hasEdgeCases) businessSoundness -= 15;
  } else if (taskType === "brd_analysis") {
    const hasKpi = /kpi|mục tiêu|business goal/i.test(content);
    const hasRisk = /rủi ro|risk/i.test(content);
    if (!hasKpi) businessSoundness -= 20;
    if (!hasRisk) businessSoundness -= 15;
  } else {
    const hasEdgeCases = /lỗi|ngoại lệ|thất bại/i.test(content);
    if (!hasEdgeCases) businessSoundness -= 15;
  }
  businessSoundness = Math.max(20, Math.min(100, businessSoundness));

  // Gherkin & Traceability
  let gherkinScore = 90;
  if (taskType === "prd_analysis") {
    if (structResult.issues.includes("missing_gherkin_acceptance_criteria")) {
      gherkinScore = 30;
    }
    if (structResult.issues.includes("missing_traceability_matrix")) {
      gherkinScore -= 20;
    }
  }

  // Clarity & Format
  let clarityScore = 85;
  if (content.includes("```") && content.includes("|")) clarityScore += 10;
  if (content.length > 500) clarityScore = Math.min(100, clarityScore);

  // Calculate Weighted Score
  // Weights: Completeness 25%, Business Soundness 35%, Gherkin 25%, Clarity 15%
  const weightedScore = Math.round(
    completeness * 0.25 +
    businessSoundness * 0.35 +
    gherkinScore * 0.25 +
    clarityScore * 0.15
  );

  const passThreshold = rubricConfig?.scoring?.pass_threshold || 80;
  const hasCriticalIssue = structResult.criticalIssues.length > 0;
  const passed = !hasCriticalIssue && weightedScore >= passThreshold;
  const reworkRequired = !passed || weightedScore < 85;

  let feedback = passed
    ? `Tài liệu đạt chuẩn chất lượng với số điểm ${weightedScore}/100. Các phần cốt lõi và tiêu chuẩn kiểm thử đã được thỏa mãn.`
    : `Tài liệu KHÔNG đạt chuẩn (Điểm: ${weightedScore}/100). Phát hiện lỗi: ${structResult.issues.join(", ")}.`;

  if (hasCriticalIssue) {
    feedback += ` Lỗi nghiêm trọng cần khắc phục: ${structResult.criticalIssues.join(", ")}.`;
  }

  return {
    eventId,
    taskId,
    skillId,
    skillVersion,
    taskType,
    timestamp,
    evaluationStatus: "evaluated",
    result: passed ? "pass" : "fail",
    score: weightedScore,
    evaluationMethod: "hybrid",
    issues: structResult.issues,
    reworkRequired,
    dimensionScores: {
      completeness,
      businessSoundness,
      gherkinAndTraceability: gherkinScore,
      clarityAndFormat: clarityScore,
    },
    feedback,
  };
}
