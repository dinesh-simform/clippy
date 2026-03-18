const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const crypto = require('crypto');

class ClipboardDatabase {
  // AES encryption helpers
  encrypt(text, password) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return { encrypted, iv: iv.toString('hex') };
  }

  decrypt(encrypted, password, ivHex) {
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(password, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  constructor() {
    // Store database in user data directory
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'clipboard.db');
    
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Better performance
    
    this.initDatabase();
  }

  initDatabase() {
    // Create clipboard_entries table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clipboard_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        content_type VARCHAR(50) DEFAULT 'text',
        content_hash VARCHAR(64) UNIQUE,
        timestamp INTEGER NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE,
        custom_name VARCHAR(255),
        is_encrypted BOOLEAN DEFAULT FALSE,
        iv VARCHAR(32),
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `);

    // Create custom_categories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS custom_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#3b82f6',
        icon VARCHAR(50) DEFAULT 'Label',
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );
    `);

    // Create entry_categories junction table (many-to-many)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS entry_categories (
        entry_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        PRIMARY KEY (entry_id, category_id),
        FOREIGN KEY (entry_id) REFERENCES clipboard_entries(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES custom_categories(id) ON DELETE CASCADE
      );
    `);

    // Create index for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON clipboard_entries(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_content_hash ON clipboard_entries(content_hash);
      CREATE INDEX IF NOT EXISTS idx_favorite ON clipboard_entries(is_favorite);
      CREATE INDEX IF NOT EXISTS idx_custom_name ON clipboard_entries(custom_name);
      CREATE INDEX IF NOT EXISTS idx_entry_categories_entry ON entry_categories(entry_id);
      CREATE INDEX IF NOT EXISTS idx_entry_categories_category ON entry_categories(category_id);
      CREATE TABLE IF NOT EXISTS ai_entry_metadata (
        entry_id INTEGER PRIMARY KEY,
        tags TEXT DEFAULT '[]',
        summary TEXT,
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (entry_id) REFERENCES clipboard_entries(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_ai_entry_tags ON ai_entry_metadata(entry_id);
      
      CREATE TABLE IF NOT EXISTS ai_chat_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      );

      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        role VARCHAR(16) NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_ai_chat_session ON ai_chat_messages(session_id);

      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER NOT NULL,
        remind_at INTEGER NOT NULL,
        note TEXT,
        triggered INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
        FOREIGN KEY (entry_id) REFERENCES clipboard_entries(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);
    `);

    console.log('Database initialized successfully');
  }

  // Generate hash for duplicate detection
  generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Add new clipboard entry
  /**
   * Add new clipboard entry
   * @param {string} content - The clipboard text
   * @param {object} opts - { encrypt: boolean, password: string }
   */
  /**
   * Add new clipboard entry
   * @param {string} content - The clipboard text
   * @param {object} opts - { encrypt: boolean, password: string, title?: string }
   */
  addEntry(content, opts = { encrypt: false, password: '', title: '' }) {
    try {
      const contentHash = this.generateHash(content);
      const now = Date.now();
      // Check if entry already exists
      const existing = this.db.prepare(
        'SELECT id FROM clipboard_entries WHERE content_hash = ?'
      ).get(contentHash);
      if (existing) {
        this.db.prepare(
          'UPDATE clipboard_entries SET timestamp = ? WHERE id = ?'
        ).run(now, existing.id);
        return existing.id;
      }
      let dbContent = content;
      let isEncrypted = 0;
      let iv = null;
      if (opts.encrypt && opts.password) {
        const { encrypted, iv: ivHex } = this.encrypt(content, opts.password);
        dbContent = encrypted;
        isEncrypted = 1;
        iv = ivHex;
      }
      const customName = opts.title || null;
      const stmt = this.db.prepare(`
        INSERT INTO clipboard_entries (content, content_hash, timestamp, is_encrypted, iv, custom_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(dbContent, contentHash, now, isEncrypted, iv, customName);
      return result.lastInsertRowid;
    } catch (error) {
      console.error('Error adding entry:', error);
      return null;
    }
  }

  // Get recent entries
  getRecentEntries(limit = 10) {
    try {
      const stmt = this.db.prepare(`
        SELECT id, content, timestamp, is_favorite, custom_name, is_encrypted, iv
        FROM clipboard_entries
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      return stmt.all(limit);
    } catch (error) {
      console.error('Error getting recent entries:', error);
      return [];
    }
  }

  // Get all entries
  getAllEntries() {
    try {
      const stmt = this.db.prepare(`
        SELECT id, content, timestamp, is_favorite, custom_name, is_encrypted, iv
        FROM clipboard_entries
        ORDER BY timestamp DESC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error getting all entries:', error);
      return [];
    }
  }

  // Get entry by ID
  getEntry(id) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM clipboard_entries WHERE id = ?
      `);
      
      return stmt.get(id);
    } catch (error) {
      console.error('Error getting entry:', error);
      return null;
    }
  }

  // Delete entry
  deleteEntry(id) {
    try {
      const stmt = this.db.prepare('DELETE FROM clipboard_entries WHERE id = ?');
      stmt.run(id);
      return true;
    } catch (error) {
      console.error('Error deleting entry:', error);
      return false;
    }
  }

  // Clear all entries
  clearAll() {
    try {
      this.db.exec('DELETE FROM clipboard_entries');
      return true;
    } catch (error) {
      console.error('Error clearing entries:', error);
      return false;
    }
  }

  // Toggle favorite
  toggleFavorite(id) {
    try {
      const stmt = this.db.prepare(`
        UPDATE clipboard_entries 
        SET is_favorite = NOT is_favorite 
        WHERE id = ?
      `);
      stmt.run(id);
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  // Update custom name
  updateCustomName(id, name) {
    try {
      const stmt = this.db.prepare(`
        UPDATE clipboard_entries 
        SET custom_name = ? 
        WHERE id = ?
      `);
      stmt.run(name, id);
      return true;
    } catch (error) {
      console.error('Error updating name:', error);
      return false;
    }
  }

  // Get total count
  getCount() {
    try {
      const result = this.db.prepare('SELECT COUNT(*) as count FROM clipboard_entries').get();
      return result.count;
    } catch (error) {
      console.error('Error getting count:', error);
      return 0;
    }
  }

  // Search entries
  searchEntries(query) {
    try {
      const stmt = this.db.prepare(`
        SELECT id, content, timestamp, is_favorite, custom_name
        FROM clipboard_entries
        WHERE content LIKE ? OR custom_name LIKE ?
        ORDER BY timestamp DESC
      `);
      
      const searchTerm = `%${query}%`;
      return stmt.all(searchTerm, searchTerm);
    } catch (error) {
      console.error('Error searching entries:', error);
      return [];
    }
  }

  // ===== CUSTOM CATEGORIES =====

  // Create a new custom category
  createCategory(name, color = '#3b82f6', icon = 'Label') {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO custom_categories (name, color, icon)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run(name, color, icon);
      return result.lastInsertRowid;
    } catch (error) {
      console.error('Error creating category:', error);
      return null;
    }
  }

  // Get all custom categories
  getAllCategories() {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM custom_categories
        ORDER BY name ASC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Update a category
  updateCategory(id, name, color, icon) {
    try {
      const stmt = this.db.prepare(`
        UPDATE custom_categories
        SET name = ?, color = ?, icon = ?
        WHERE id = ?
      `);
      stmt.run(name, color, icon, id);
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      return false;
    }
  }

  // Delete a category
  deleteCategory(id) {
    try {
      const stmt = this.db.prepare('DELETE FROM custom_categories WHERE id = ?');
      stmt.run(id);
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  // Assign category to entry
  assignCategory(entryId, categoryId) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO entry_categories (entry_id, category_id)
        VALUES (?, ?)
      `);
      stmt.run(entryId, categoryId);
      return true;
    } catch (error) {
      console.error('Error assigning category:', error);
      return false;
    }
  }

  // Remove category from entry
  removeCategory(entryId, categoryId) {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM entry_categories
        WHERE entry_id = ? AND category_id = ?
      `);
      stmt.run(entryId, categoryId);
      return true;
    } catch (error) {
      console.error('Error removing category:', error);
      return false;
    }
  }

  // Replace all categories for an entry in a single transaction
  setEntryCategories(entryId, categoryIds = []) {
    try {
      const normalizedCategoryIds = Array.from(
        new Set(
          (Array.isArray(categoryIds) ? categoryIds : [])
            .map((id) => parseInt(id, 10))
            .filter((id) => Number.isFinite(id))
        )
      );

      const replaceCategoriesTx = this.db.transaction((targetEntryId, ids) => {
        this.db.prepare('DELETE FROM entry_categories WHERE entry_id = ?').run(targetEntryId);

        if (ids.length === 0) return;

        const insertStmt = this.db.prepare(`
          INSERT OR IGNORE INTO entry_categories (entry_id, category_id)
          VALUES (?, ?)
        `);

        ids.forEach((categoryId) => {
          insertStmt.run(targetEntryId, categoryId);
        });
      });

      replaceCategoriesTx(entryId, normalizedCategoryIds);
      return true;
    } catch (error) {
      console.error('Error replacing entry categories:', error);
      return false;
    }
  }

  // Get categories for an entry
  getEntryCategories(entryId) {
    try {
      const stmt = this.db.prepare(`
        SELECT c.* FROM custom_categories c
        INNER JOIN entry_categories ec ON c.id = ec.category_id
        WHERE ec.entry_id = ?
      `);
      return stmt.all(entryId);
    } catch (error) {
      console.error('Error getting entry categories:', error);
      return [];
    }
  }

  // Tags / AI metadata helpers
  getEntryTags(entryId) {
    try {
      const stmt = this.db.prepare(`SELECT tags FROM ai_entry_metadata WHERE entry_id = ?`);
      const row = stmt.get(entryId);
      if (!row || !row.tags) return [];
      try { return JSON.parse(row.tags); } catch (e) { return []; }
    } catch (error) {
      console.error('Error getting entry tags:', error);
      return [];
    }
  }

  setEntryTags(entryId, tags = []) {
    try {
      const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);
      const now = Date.now();
      const stmt = this.db.prepare(`
        INSERT INTO ai_entry_metadata (entry_id, tags, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(entry_id) DO UPDATE SET tags = excluded.tags, updated_at = excluded.updated_at
      `);
      stmt.run(entryId, tagsJson, now);
      return true;
    } catch (error) {
      console.error('Error setting entry tags:', error);
      return false;
    }
  }

  // Chat session helpers
  createChatSession(title = null) {
    try {
      const now = Date.now();
      const stmt = this.db.prepare(`INSERT INTO ai_chat_sessions (title, created_at) VALUES (?, ?)`);
      const result = stmt.run(title || null, now);
      return result.lastInsertRowid;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  }

  addChatMessage(sessionId, role, content) {
    try {
      const ts = Date.now();
      const stmt = this.db.prepare(`INSERT INTO ai_chat_messages (session_id, role, content, timestamp) VALUES (?, ?, ?, ?)`);
      stmt.run(sessionId, role, content, ts);
      return true;
    } catch (error) {
      console.error('Error adding chat message:', error);
      return false;
    }
  }

  getChatSessions(limit = 50) {
    try {
      const stmt = this.db.prepare(`SELECT id, title, created_at FROM ai_chat_sessions ORDER BY created_at DESC LIMIT ?`);
      return stmt.all(limit);
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      return [];
    }
  }

  getChatMessages(sessionId) {
    try {
      const stmt = this.db.prepare(`SELECT id, role, content, timestamp FROM ai_chat_messages WHERE session_id = ? ORDER BY timestamp ASC`);
      return stmt.all(sessionId);
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  // ===== REMINDERS =====

  addReminder(entryId, remindAt, note = '') {
    try {
      const now = Date.now();
      const stmt = this.db.prepare(`INSERT INTO reminders (entry_id, remind_at, note, created_at) VALUES (?, ?, ?, ?)`);
      const result = stmt.run(entryId, remindAt, note || '', now);
      return result.lastInsertRowid;
    } catch (error) {
      console.error('Error adding reminder:', error);
      return null;
    }
  }

  cancelReminder(reminderId) {
    try {
      this.db.prepare(`DELETE FROM reminders WHERE id = ?`).run(reminderId);
      return true;
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      return false;
    }
  }

  getActiveReminders() {
    try {
      const stmt = this.db.prepare(`
        SELECT r.id, r.entry_id, r.remind_at, r.note,
               e.content, e.custom_name
        FROM reminders r
        LEFT JOIN clipboard_entries e ON e.id = r.entry_id
        WHERE r.triggered = 0
        ORDER BY r.remind_at ASC
      `);
      return stmt.all();
    } catch (error) {
      console.error('Error getting active reminders:', error);
      return [];
    }
  }

  markReminderTriggered(reminderId) {
    try {
      this.db.prepare(`UPDATE reminders SET triggered = 1 WHERE id = ?`).run(reminderId);
      return true;
    } catch (error) {
      console.error('Error marking reminder triggered:', error);
      return false;
    }
  }

  getRemindersForEntry(entryId) {
    try {
      const stmt = this.db.prepare(`SELECT id, remind_at, note, triggered, created_at FROM reminders WHERE entry_id = ? ORDER BY remind_at ASC`);
      return stmt.all(entryId);
    } catch (error) {
      console.error('Error getting reminders for entry:', error);
      return [];
    }
  }

  // Get entries by category
  getEntriesByCategory(categoryId) {
    try {
      const stmt = this.db.prepare(`
        SELECT e.* FROM clipboard_entries e
        INNER JOIN entry_categories ec ON e.id = ec.entry_id
        WHERE ec.category_id = ?
        ORDER BY e.timestamp DESC
      `);
      return stmt.all(categoryId);
    } catch (error) {
      console.error('Error getting entries by category:', error);
      return [];
    }
  }

  // Get entries with categories attached
  getAllEntriesWithCategories() {
    try {
      const entries = this.getAllEntries();
      // Collect entry ids
      const entryIds = entries.map(e => e.id);
      const tagsById = new Map();
      if (entryIds.length > 0) {
        const placeholders = entryIds.map(() => '?').join(',');
        const stmt = this.db.prepare(`SELECT entry_id, tags FROM ai_entry_metadata WHERE entry_id IN (${placeholders})`);
        const rows = stmt.all(...entryIds);
        rows.forEach(r => {
          try { tagsById.set(r.entry_id, JSON.parse(r.tags)); } catch (e) { tagsById.set(r.entry_id, []); }
        });
      }
      return entries.map(entry => ({
        ...entry,
        categories: this.getEntryCategories(entry.id),
        tags: tagsById.get(entry.id) || []
      }));
    } catch (error) {
      console.error('Error getting entries with categories:', error);
      return [];
    }
  }

  // Build SQL condition for built-in and custom category filters
  buildCategoryCondition(category, tableAlias = 'e') {
    const normalized = (category || '').toString();
    const contentExpr = `LOWER(TRIM(${tableAlias}.content))`;

    if (normalized === 'favorites') {
      return { clause: `${tableAlias}.is_favorite = 1`, params: [] };
    }

    if (normalized === 'urls') {
      return {
        clause: `(${contentExpr} LIKE 'http://%' OR ${contentExpr} LIKE 'https://%')`,
        params: []
      };
    }

    if (normalized === 'emails') {
      return {
        clause: `(
          ${contentExpr} LIKE '%@%.%'
          AND ${contentExpr} NOT LIKE '% %'
        )`,
        params: []
      };
    }

    if (normalized === 'code') {
      return {
        clause: `(
          ${contentExpr} LIKE 'function%'
          OR ${contentExpr} LIKE 'const%'
          OR ${contentExpr} LIKE 'let%'
          OR ${contentExpr} LIKE 'var%'
          OR ${contentExpr} LIKE 'class%'
          OR ${contentExpr} LIKE 'import%'
          OR ${contentExpr} LIKE 'export%'
          OR ${contentExpr} LIKE 'if%'
          OR ${contentExpr} LIKE 'for%'
          OR ${contentExpr} LIKE 'while%'
        )`,
        params: []
      };
    }

    if (normalized.startsWith('custom-')) {
      const parsedId = parseInt(normalized.replace('custom-', ''), 10);
      if (Number.isFinite(parsedId)) {
        return {
          clause: `EXISTS (
            SELECT 1 FROM entry_categories ec
            WHERE ec.entry_id = ${tableAlias}.id AND ec.category_id = ?
          )`,
          params: [parsedId]
        };
      }
    }

    if (typeof category === 'number' && Number.isFinite(category)) {
      return {
        clause: `EXISTS (
          SELECT 1 FROM entry_categories ec
          WHERE ec.entry_id = ${tableAlias}.id AND ec.category_id = ?
        )`,
        params: [category]
      };
    }

    return { clause: '', params: [] };
  }

  // Compute date bounds for date filter values
  getDateRangeBounds(range) {
    if (!range || range === 'all') return null;

    const now = new Date();
    let start;
    let end = now.getTime();

    if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    } else if (range === 'yesterday') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    } else if (range === 'last7days') {
      start = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    } else if (range === 'last30days') {
      start = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    } else if (range === 'last90days') {
      start = now.getTime() - 90 * 24 * 60 * 60 * 1000;
    }

    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { start, end };
  }

  // Query entries with server-side filters and pagination
  getEntriesWithFilters(options = {}) {
    try {
      const {
        selectedCategory = 'all',
        selectedCategoryChips = [],
        searchQuery = '',
        dateRange = 'all',
        page = 1,
        pageSize = 50
      } = options;

      const safePage = Math.max(1, parseInt(page, 10) || 1);
      const safePageSize = Math.min(200, Math.max(10, parseInt(pageSize, 10) || 50));
      const offset = (safePage - 1) * safePageSize;

      const whereClauses = [];
      const whereParams = [];

      if (selectedCategory && selectedCategory !== 'all') {
        const { clause, params } = this.buildCategoryCondition(selectedCategory, 'e');
        if (clause) {
          whereClauses.push(clause);
          whereParams.push(...params);
        }
      }

      if (Array.isArray(selectedCategoryChips) && selectedCategoryChips.length > 0) {
        const chipClauses = [];
        const chipParams = [];

        selectedCategoryChips.forEach((chip) => {
          const { clause, params } = this.buildCategoryCondition(chip, 'e');
          if (clause) {
            chipClauses.push(clause);
            chipParams.push(...params);
          }
        });

        if (chipClauses.length > 0) {
          whereClauses.push(`(${chipClauses.join(' OR ')})`);
          whereParams.push(...chipParams);
        }
      }

      const normalizedSearch = (searchQuery || '').trim().toLowerCase();
      if (normalizedSearch) {
        whereClauses.push("(LOWER(e.content) LIKE ? OR LOWER(COALESCE(e.custom_name, '')) LIKE ?)");
        const searchLike = `%${normalizedSearch}%`;
        whereParams.push(searchLike, searchLike);
      }

      // If explicit timestamps provided, use them; otherwise derive from named range
      if (options.startTimestamp !== undefined && options.endTimestamp !== undefined) {
        whereClauses.push('e.timestamp >= ? AND e.timestamp <= ?');
        whereParams.push(options.startTimestamp, options.endTimestamp);
      } else {
        const dateBounds = this.getDateRangeBounds(dateRange);
        if (dateBounds) {
          whereClauses.push('e.timestamp >= ? AND e.timestamp <= ?');
          whereParams.push(dateBounds.start, dateBounds.end);
        }
      }

      const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const totalStmt = this.db.prepare(`
        SELECT COUNT(*) as total
        FROM clipboard_entries e
        ${whereSQL}
      `);
      const total = totalStmt.get(...whereParams).total;

      const entriesStmt = this.db.prepare(`
        SELECT e.id, e.content, e.timestamp, e.is_favorite, e.custom_name, e.is_encrypted, e.iv
        FROM clipboard_entries e
        ${whereSQL}
        ORDER BY e.timestamp DESC
        LIMIT ? OFFSET ?
      `);
      const rows = entriesStmt.all(...whereParams, safePageSize, offset);

      let categoriesByEntryId = new Map();
      if (rows.length > 0) {
        const entryIds = rows.map((entry) => entry.id);
        const placeholders = entryIds.map(() => '?').join(',');
        const categoriesStmt = this.db.prepare(`
          SELECT ec.entry_id, c.id, c.name, c.color, c.icon, c.created_at
          FROM entry_categories ec
          INNER JOIN custom_categories c ON c.id = ec.category_id
          WHERE ec.entry_id IN (${placeholders})
          ORDER BY c.name ASC
        `);
        const categoryRows = categoriesStmt.all(...entryIds);

        categoriesByEntryId = categoryRows.reduce((acc, row) => {
          if (!acc.has(row.entry_id)) {
            acc.set(row.entry_id, []);
          }
          acc.get(row.entry_id).push({
            id: row.id,
            name: row.name,
            color: row.color,
            icon: row.icon,
            created_at: row.created_at
          });
          return acc;
        }, new Map());
      }

      const items = rows.map((entry) => ({
        ...entry,
        categories: categoriesByEntryId.get(entry.id) || [],
        tags: []
      }));
      // Attach tags for these entries
      if (items.length > 0) {
        const ids = items.map(i => i.id);
        const placeholders = ids.map(() => '?').join(',');
        const tagsStmt = this.db.prepare(`SELECT entry_id, tags FROM ai_entry_metadata WHERE entry_id IN (${placeholders})`);
        const tagRows = tagsStmt.all(...ids);
        const tagsMap = tagRows.reduce((acc, r) => {
          try { acc.set(r.entry_id, JSON.parse(r.tags)); } catch (e) { acc.set(r.entry_id, []); }
          return acc;
        }, new Map());
        items.forEach(it => { it.tags = tagsMap.get(it.id) || []; });
      }

      return {
        items,
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.max(1, Math.ceil(total / safePageSize))
      };
    } catch (error) {
      console.error('Error getting filtered entries:', error);
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 50,
        totalPages: 1
      };
    }
  }

  // Filter entries by date range
  getEntriesByDateRange(startTimestamp, endTimestamp) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM clipboard_entries
        WHERE timestamp >= ? AND timestamp <= ?
        ORDER BY timestamp DESC
      `);
      return stmt.all(startTimestamp, endTimestamp);
    } catch (error) {
      console.error('Error filtering by date:', error);
      return [];
    }
  }

  // Close database connection
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = ClipboardDatabase;
