const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');
const logger = require('../middleware/logger');

// Database migration script
class DatabaseMigration {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.migrationsTable = 'schema_migrations';
  }

  // Run all pending migrations
  async migrate() {
    try {
      logger.info('Starting database migration...');
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      
      // Get all migration files
      const migrationFiles = await this.getMigrationFiles();
      
      // Get applied migrations from database
      const appliedMigrations = await this.getAppliedMigrations();
      
      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        file => !appliedMigrations.includes(file.name)
      );
      
      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations found');
        return;
      }
      
      logger.info(`Found ${pendingMigrations.length} pending migrations`);
      
      // Apply each pending migration
      for (const migration of pendingMigrations) {
        await this.applyMigration(migration);
      }
      
      logger.info('Database migration completed successfully');
      
    } catch (error) {
      logger.error('Migration failed:', { error: error.message });
      throw error;
    }
  }

  // Rollback migrations
  async rollback(steps = 1) {
    try {
      logger.info(`Rolling back ${steps} migration(s)...`);
      
      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      
      if (appliedMigrations.length === 0) {
        logger.info('No migrations to rollback');
        return;
      }
      
      // Get migrations to rollback (most recent first)
      const migrationsToRollback = appliedMigrations
        .sort()
        .reverse()
        .slice(0, steps);
      
      // Rollback each migration
      for (const migrationName of migrationsToRollback) {
        await this.rollbackMigration(migrationName);
      }
      
      logger.info(`Successfully rolled back ${steps} migration(s)`);
      
    } catch (error) {
      logger.error('Rollback failed:', { error: error.message });
      throw error;
    }
  }

  // Create migrations tracking table
  async createMigrationsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await sequelize.query(query);
    logger.info('Migrations table created/verified');
  }

  // Get all migration files
  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsPath);
      return files
        .filter(file => file.endsWith('.js'))
        .map(file => ({
          name: path.basename(file, '.js'),
          path: path.join(this.migrationsPath, file)
        }))
        .sort();
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Migrations directory doesn't exist, create it
        fs.mkdirSync(this.migrationsPath, { recursive: true });
        return [];
      }
      throw error;
    }
  }

  // Get applied migrations from database
  async getAppliedMigrations() {
    try {
      const [results] = await sequelize.query(
        `SELECT name FROM ${this.migrationsTable} ORDER BY applied_at`
      );
      return results.map(row => row.name);
    } catch (error) {
      if (error.message.includes('relation "schema_migrations" does not exist')) {
        return [];
      }
      throw error;
    }
  }

  // Apply a single migration
  async applyMigration(migration) {
    try {
      logger.info(`Applying migration: ${migration.name}`);
      
      // Load migration module
      const migrationModule = require(migration.path);
      
      // Run migration in transaction
      await sequelize.transaction(async (transaction) => {
        // Execute up migration
        if (migrationModule.up) {
          await migrationModule.up(sequelize.queryInterface, transaction);
        }
        
        // Record migration as applied
        await sequelize.query(
          `INSERT INTO ${this.migrationsTable} (name) VALUES (?)`,
          {
            replacements: [migration.name],
            transaction
          }
        );
      });
      
      logger.info(`Successfully applied migration: ${migration.name}`);
      
    } catch (error) {
      logger.error(`Failed to apply migration ${migration.name}:`, { error: error.message });
      throw error;
    }
  }

  // Rollback a single migration
  async rollbackMigration(migrationName) {
    try {
      logger.info(`Rolling back migration: ${migrationName}`);
      
      // Find migration file
      const migrationFiles = await this.getMigrationFiles();
      const migration = migrationFiles.find(m => m.name === migrationName);
      
      if (!migration) {
        throw new Error(`Migration file not found: ${migrationName}`);
      }
      
      // Load migration module
      const migrationModule = require(migration.path);
      
      // Run rollback in transaction
      await sequelize.transaction(async (transaction) => {
        // Execute down migration if available
        if (migrationModule.down) {
          await migrationModule.down(sequelize.queryInterface, transaction);
        }
        
        // Remove migration record
        await sequelize.query(
          `DELETE FROM ${this.migrationsTable} WHERE name = ?`,
          {
            replacements: [migrationName],
            transaction
          }
        );
      });
      
      logger.info(`Successfully rolled back migration: ${migrationName}`);
      
    } catch (error) {
      logger.error(`Failed to rollback migration ${migrationName}:`, { error: error.message });
      throw error;
    }
  }

  // Reset database (drop all tables and re-run migrations)
  async reset() {
    try {
      logger.info('Resetting database...');
      
      // Drop all tables
      await sequelize.drop();
      logger.info('All tables dropped');
      
      // Re-run migrations
      await this.migrate();
      
      logger.info('Database reset completed successfully');
      
    } catch (error) {
      logger.error('Database reset failed:', { error: error.message });
      throw error;
    }
  }

  // Get migration status
  async status() {
    try {
      const migrationFiles = await this.getMigrationFiles();
      const appliedMigrations = await this.getAppliedMigrations();
      
      console.log('\n📊 Migration Status:');
      console.log('='.repeat(50));
      
      for (const file of migrationFiles) {
        const isApplied = appliedMigrations.includes(file.name);
        const status = isApplied ? '✅ APPLIED' : '⏳ PENDING';
        console.log(`${status} ${file.name}`);
      }
      
      console.log('='.repeat(50));
      console.log(`Total: ${migrationFiles.length} migrations`);
      console.log(`Applied: ${appliedMigrations.length}`);
      console.log(`Pending: ${migrationFiles.length - appliedMigrations.length}`);
      
    } catch (error) {
      logger.error('Failed to get migration status:', { error: error.message });
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const migration = new DatabaseMigration();
  
  try {
    switch (command) {
      case 'migrate':
        await migration.migrate();
        break;
        
      case 'rollback':
        const steps = parseInt(args[1]) || 1;
        await migration.rollback(steps);
        break;
        
      case 'reset':
        await migration.reset();
        break;
        
      case 'status':
        await migration.status();
        break;
        
      default:
        console.log(`
Usage: node scripts/migrate.js [command]

Commands:
  migrate              Run all pending migrations
  rollback [steps]     Rollback last migration(s) (default: 1)
  reset                Reset database and re-run all migrations
  status               Show migration status
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration script failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DatabaseMigration;