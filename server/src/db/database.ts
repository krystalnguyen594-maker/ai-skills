import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export interface EventRecord {
  event_id: string;
  task_id: string;
  skill_id: string;
  skill_version: string;
  task_type: string;
  timestamp: string;
  evaluation_status: string;
  result: string;
  score: number;
  evaluation_method: string;
  rework_required: boolean;
  feedback?: string | null;
  issues: string[];
  client_info?: {
    client_id?: string;
    runtime?: string;
    opt_in?: boolean;
  };
}

export class EvalDatabase {
  private db: DatabaseSync;

  constructor(dbPath?: string) {
    const finalPath = dbPath || path.join(process.cwd(), "server", "data", "eval.db");
    const dir = path.dirname(finalPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new DatabaseSync(finalPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        event_id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        skill_id TEXT NOT NULL,
        skill_version TEXT NOT NULL,
        task_type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        evaluation_status TEXT NOT NULL,
        result TEXT NOT NULL,
        score REAL NOT NULL,
        evaluation_method TEXT NOT NULL,
        rework_required INTEGER NOT NULL,
        feedback TEXT,
        client_id TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS event_issues (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        issue_code TEXT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(event_id)
      );

      CREATE TABLE IF NOT EXISTS weekly_reports (
        id TEXT PRIMARY KEY,
        reporting_window TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        total_events INTEGER NOT NULL,
        pass_rate REAL NOT NULL,
        rework_rate REAL NOT NULL,
        markdown_path TEXT NOT NULL,
        html_path TEXT NOT NULL,
        email_status TEXT NOT NULL
      );
    `);
  }

  public saveEvent(event: EventRecord): { inserted: boolean; isDuplicate: boolean } {
    const checkStmt = this.db.prepare("SELECT event_id FROM events WHERE event_id = ?");
    const existing = checkStmt.get(event.event_id);

    if (existing) {
      return { inserted: false, isDuplicate: true };
    }

    const insertEvent = this.db.prepare(`
      INSERT INTO events (
        event_id, task_id, skill_id, skill_version, task_type,
        timestamp, evaluation_status, result, score, evaluation_method,
        rework_required, feedback, client_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      event.event_id,
      event.task_id,
      event.skill_id,
      event.skill_version,
      event.task_type,
      event.timestamp,
      event.evaluation_status,
      event.result,
      event.score,
      event.evaluation_method,
      event.rework_required ? 1 : 0,
      event.feedback || null,
      event.client_info?.client_id || "unknown",
      new Date().toISOString()
    );

    if (event.issues && event.issues.length > 0) {
      const insertIssue = this.db.prepare(
        "INSERT INTO event_issues (event_id, issue_code) VALUES (?, ?)"
      );
      for (const issue of event.issues) {
        insertIssue.run(event.event_id, issue);
      }
    }

    return { inserted: true, isDuplicate: false };
  }

  public getEvents(limit = 100): any[] {
    const stmt = this.db.prepare("SELECT * FROM events ORDER BY timestamp DESC LIMIT ?");
    return stmt.all(limit);
  }

  public getMetricsSummary() {
    const totalStmt = this.db.prepare("SELECT COUNT(*) as count FROM events");
    const totalResult = totalStmt.get() as any;
    const total = totalResult?.count || 0;

    if (total === 0) {
      return {
        totalEvents: 0,
        passCount: 0,
        failCount: 0,
        passRate: 0,
        reworkRate: 0,
        topIssues: [],
      };
    }

    const passStmt = this.db.prepare("SELECT COUNT(*) as count FROM events WHERE result = 'pass'");
    const passCount = (passStmt.get() as any)?.count || 0;

    const reworkStmt = this.db.prepare("SELECT COUNT(*) as count FROM events WHERE rework_required = 1");
    const reworkCount = (reworkStmt.get() as any)?.count || 0;

    const issuesStmt = this.db.prepare(`
      SELECT issue_code, COUNT(*) as freq
      FROM event_issues
      GROUP BY issue_code
      ORDER BY freq DESC
      LIMIT 5
    `);
    const topIssues = issuesStmt.all() as any[];

    return {
      totalEvents: total,
      passCount,
      failCount: total - passCount,
      passRate: Math.round((passCount / total) * 100),
      reworkRate: Math.round((reworkCount / total) * 100),
      topIssues,
    };
  }

  public getSkillMetrics(): any[] {
    const stmt = this.db.prepare(`
      SELECT 
        skill_id,
        skill_version,
        task_type,
        COUNT(*) as total_events,
        SUM(CASE WHEN result = 'pass' THEN 1 ELSE 0 END) as pass_count,
        ROUND(AVG(score), 1) as avg_score
      FROM events
      GROUP BY skill_id
      ORDER BY skill_id ASC
    `);
    const rows = stmt.all() as any[];
    return rows.map((row: any) => ({
      skill_id: row.skill_id,
      skill_version: row.skill_version,
      task_type: row.task_type,
      total_events: row.total_events,
      pass_count: row.pass_count,
      avg_score: row.avg_score,
      pass_rate: Math.round((row.pass_count / (row.total_events || 1)) * 100)
    }));
  }

  public saveReport(report: {
    id: string;
    reporting_window: string;
    generated_at: string;
    total_events: number;
    pass_rate: number;
    rework_rate: number;
    markdown_path: string;
    html_path: string;
    email_status: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO weekly_reports (
        id, reporting_window, generated_at, total_events,
        pass_rate, rework_rate, markdown_path, html_path, email_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      report.id,
      report.reporting_window,
      report.generated_at,
      report.total_events,
      report.pass_rate,
      report.rework_rate,
      report.markdown_path,
      report.html_path,
      report.email_status
    );
  }
}
