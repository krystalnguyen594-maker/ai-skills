export interface SectionRule {
  pattern: string;
  name: string;
  severity: "critical" | "major" | "minor";
}

export interface ProhibitedRule {
  pattern: string;
  issue_code: string;
  description: string;
  severity: "critical" | "major" | "minor";
}

export interface TaskTypeConfig {
  id: string;
  name: string;
  required_sections: SectionRule[];
}

export interface StructuralCheckResult {
  passed: boolean;
  score: number;
  criticalIssues: string[];
  issues: string[];
  sectionCheck: { name: string; found: boolean; severity: string }[];
}

/**
 * Deterministic rule-based checker for documentation output.
 * Checks for mandatory markdown sections, Gherkin acceptance criteria,
 * traceability tables, and separation of concerns.
 */
export function checkStructure(
  content: string,
  taskType: string,
  taskConfig?: TaskTypeConfig,
  prohibitedRules?: ProhibitedRule[]
): StructuralCheckResult {
  const issues: string[] = [];
  const criticalIssues: string[] = [];
  const sectionCheck: { name: string; found: boolean; severity: string }[] = [];

  let score = 100;

  // 1. Check required sections
  if (taskConfig && taskConfig.required_sections) {
    for (const rule of taskConfig.required_sections) {
      const cleanPattern = rule.pattern.replace(/^\(\?i\)/i, "");
      const regex = new RegExp(cleanPattern, "im");
      const found = regex.test(content);
      sectionCheck.push({ name: rule.name, found, severity: rule.severity });

      if (!found) {
        const issueCode = `missing_${rule.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
        issues.push(issueCode);

        if (rule.severity === "critical") {
          criticalIssues.push(issueCode);
          score -= 30;
        } else if (rule.severity === "major") {
          score -= 15;
        } else {
          score -= 5;
        }
      }
    }
  }

  // 2. Check prohibited patterns (e.g. DDL/code leakage in FRD)
  if (prohibitedRules && prohibitedRules.length > 0) {
    for (const rule of prohibitedRules) {
      const cleanPattern = rule.pattern.replace(/^\(\?i\)/i, "");
      const regex = new RegExp(cleanPattern, "im");
      if (regex.test(content)) {
        issues.push(rule.issue_code);
        if (rule.severity === "critical") {
          criticalIssues.push(rule.issue_code);
          score -= 40;
        } else {
          score -= 20;
        }
      }
    }
  }

  // 3. Domain-specific structural checks
  if (taskType === "prd_analysis") {
    // Check Gherkin keywords
    const hasGiven = /given\b/i.test(content);
    const hasWhen = /when\b/i.test(content);
    const hasThen = /then\b/i.test(content);

    if (!hasGiven || !hasWhen || !hasThen) {
      const issue = "missing_gherkin_acceptance_criteria";
      issues.push(issue);
      criticalIssues.push(issue);
      score -= 25;
    }

    // Check Traceability table
    const hasTraceabilityTable = /\|\s*ID\b.*\|\s*Mục Tiêu\b|\|\s*Traceability\b/i.test(content);
    if (!hasTraceabilityTable) {
      issues.push("missing_traceability_matrix");
      score -= 10;
    }
  } else if (taskType === "frd_analysis") {
    // Check State Machine or FSM representation
    const hasFsm = /mermaid|stateDiagram|FSM|trạng thái|Pending|Approved/i.test(content);
    if (!hasFsm) {
      issues.push("missing_state_machine_workflow");
      score -= 15;
    }
  }

  score = Math.max(0, Math.min(100, score));
  const passed = criticalIssues.length === 0 && score >= 80;

  return {
    passed,
    score,
    criticalIssues,
    issues,
    sectionCheck,
  };
}
