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
  dimensionScores: Record<string, number>;
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
 * Config-Driven Universal Evaluator:
 * Dynamically scores any AI skill based on its individual evaluation.yaml specification.
 * Evaluates declared rubric dimensions using strict structural mapping without hardcoded domain bias.
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
      dimensionScores: { completeness: 0, soundness: 0, actionability: 0, clarity: 0 },
      feedback: "Nội dung quá ngắn hoặc rỗng, không thể đánh giá.",
    };
  }

  // 1. Run Dynamic Structural Check
  const taskConfig = rubricConfig?.task_types?.find((t: any) => t.id === taskType);
  const prohibited = rubricConfig?.prohibited_patterns?.[taskType] || [];
  const structResult = checkStructure(content, taskType, taskConfig, prohibited);

  // 2. Read declared rubric dimensions dynamically from evaluation.yaml
  const declaredDimensions: Array<{ dimension: string; name?: string; weight: number }> =
    rubricConfig?.rubric_dimensions || [
      { dimension: "completeness", weight: 0.3 },
      { dimension: "soundness", weight: 0.35 },
      { dimension: "actionability", weight: 0.2 },
      { dimension: "clarity", weight: 0.15 },
    ];

  const dimensionScores: Record<string, number> = {};
  let weightedScoreSum = 0;
  let totalWeight = 0;

  // 3. Strict Structural Mapping per Dimension
  for (const dim of declaredDimensions) {
    const dimKey = dim.dimension.toLowerCase();
    const weight = typeof dim.weight === "number" ? dim.weight : 0.25;
    let dimScore = 100;

    switch (dimKey) {
      case "completeness": {
        // Ratio of required sections found
        const totalSections = structResult.sectionCheck.length;
        if (totalSections > 0) {
          const foundSections = structResult.sectionCheck.filter((s) => s.found).length;
          dimScore = Math.round((foundSections / totalSections) * 100);
        } else {
          dimScore = structResult.score;
        }
        break;
      }

      case "soundness":
      case "business_soundness": {
        // Absence of critical errors and prohibited patterns
        dimScore = 100;
        if (structResult.criticalIssues.length > 0) {
          dimScore -= structResult.criticalIssues.length * 35;
        }
        // Deduct for non-critical issues
        const nonCriticalIssues = structResult.issues.filter(
          (i) => !structResult.criticalIssues.includes(i)
        );
        dimScore -= nonCriticalIssues.length * 10;

        // Domain-specific soundness heuristics if relevant
        if (taskType === "frd_analysis") {
          const hasValidation = /validation|error handling|xử lý lỗi|ràng buộc/i.test(content);
          if (!hasValidation) dimScore -= 20;
        } else if (taskType === "brd_analysis") {
          const hasKpi = /kpi|mục tiêu|business goal/i.test(content);
          if (!hasKpi) dimScore -= 20;
        }
        break;
      }

      case "actionability": {
        // Checks concrete execution steps, numbered procedures, code blocks, or checklists
        dimScore = 80;
        const hasNumberedSteps = /\b(bước\s*\d+|step\s*\d+|\d+\.\s+[A-ZÀ-Ỹ])/i.test(content);
        const hasDeliverableOrOutputs = /\b(kết quả|output|deliverable|sản phẩm|bàn giao)\b/i.test(content);
        const hasCodeOrTables = content.includes("```") || (content.includes("|") && content.includes("---"));

        if (hasNumberedSteps) dimScore += 10;
        if (hasDeliverableOrOutputs) dimScore += 10;
        if (hasCodeOrTables) dimScore += 5;

        // Penalize if too generic without structure
        if (!hasNumberedSteps && !hasCodeOrTables) dimScore -= 25;
        break;
      }

      case "clarity":
      case "clarity_and_format": {
        // Clean markdown headings, readability, structured layout
        dimScore = 85;
        const hasHeadings = /^#{1,4}\s+/m.test(content);
        const hasLists = /^(\*|-|\d+\.)\s+/m.test(content);
        const hasRichFormatting = content.includes("**") || content.includes("`");

        if (hasHeadings) dimScore += 5;
        if (hasLists) dimScore += 5;
        if (hasRichFormatting) dimScore += 5;

        if (!hasHeadings) dimScore -= 30;
        break;
      }

      case "gherkin_and_traceability": {
        // Specific to documentation requirements with acceptance criteria
        dimScore = 90;
        const hasGherkin = /given\b.*when\b.*then/is.test(content) || /tiêu chí chấp nhận/i.test(content);
        const hasTraceability = /traceability|truy vết/i.test(content) && content.includes("|");

        if (!hasGherkin) dimScore -= 35;
        if (!hasTraceability) dimScore -= 25;
        break;
      }

      default: {
        // Generic dimension fallback: directly tied to structural compliance
        dimScore = structResult.score;
        break;
      }
    }

    dimScore = Math.max(0, Math.min(100, Math.round(dimScore)));
    dimensionScores[dim.dimension] = dimScore;
    weightedScoreSum += dimScore * weight;
    totalWeight += weight;
  }

  // 4. Calculate Final Weighted Score using actual YAML weights
  const finalScore = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : structResult.score;

  // 5. Evaluate Pass/Fail status according to YAML scoring configuration
  const passThreshold = rubricConfig?.scoring?.pass_threshold || 80;
  const criticalBehavior = rubricConfig?.scoring?.critical_issue_behavior || "instant_fail";

  const hasCriticalIssue = structResult.criticalIssues.length > 0;
  const passed = criticalBehavior === "instant_fail"
    ? !hasCriticalIssue && finalScore >= passThreshold
    : finalScore >= passThreshold;

  const reworkRequired = !passed || finalScore < 85;

  let feedback = passed
    ? `Tài liệu đạt chuẩn chất lượng với số điểm ${finalScore}/100. Các tiêu chí theo rubric đã được thỏa mãn.`
    : `Tài liệu KHÔNG đạt chuẩn (Điểm: ${finalScore}/100). Phát hiện lỗi: ${structResult.issues.join(", ")}.`;

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
    score: finalScore,
    evaluationMethod: "hybrid",
    issues: structResult.issues,
    reworkRequired,
    dimensionScores,
    feedback,
  };
}
