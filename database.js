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
      return entries.map(entry => ({
        ...entry,
        categories: this.getEntryCategories(entry.id)
      }));
    } catch (error) {
      console.error('Error getting entries with categories:', error);
      return [];
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
