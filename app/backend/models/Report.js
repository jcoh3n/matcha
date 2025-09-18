const db = require('../config/db');

// Report model
class Report {
  constructor(data) {
    this.id = data.id;
    this.reporterId = data.reporter_id;
    this.reportedUserId = data.reported_user_id;
    this.reason = data.reason;
    this.createdAt = data.created_at || data.createdAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      reporterId: this.reporterId,
      reportedUserId: this.reportedUserId,
      reason: this.reason,
      createdAt: this.createdAt
    };
  }

  // Create a new report in the database
  static async create(reportData) {
    const { reporterId, reportedUserId, reason } = reportData;
    const createdAt = new Date();
    
    const query = `
      INSERT INTO reports (reporter_id, reported_user_id, reason, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [reporterId, reportedUserId, reason, createdAt];
    const result = await db.query(query, values);
    return new Report(result.rows[0]);
  }

  // Find all reports by reporter ID
  static async findByReporterId(reporterId) {
    const result = await db.query('SELECT * FROM reports WHERE reporter_id = $1', [reporterId]);
    return result.rows.map(row => new Report(row));
  }

  // Find all reports for a user (reports against this user)
  static async findByReportedUserId(reportedUserId) {
    const result = await db.query('SELECT * FROM reports WHERE reported_user_id = $1', [reportedUserId]);
    return result.rows.map(row => new Report(row));
  }

  // Check if a user has already reported another user
  static async exists(reporterId, reportedUserId) {
    const result = await db.query(
      'SELECT 1 FROM reports WHERE reporter_id = $1 AND reported_user_id = $2',
      [reporterId, reportedUserId]
    );
    return result.rows.length > 0;
  }

  // Delete all reports for a user
  static async deleteAllByUserId(userId) {
    const result = await db.query('DELETE FROM reports WHERE reporter_id = $1 OR reported_user_id = $1', [userId]);
    return result.rowCount;
  }
}

module.exports = Report;