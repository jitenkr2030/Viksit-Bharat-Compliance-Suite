module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create schema_migrations table
    await queryInterface.createTable('schema_migrations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      applied_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Create user_activity_logs table
    await queryInterface.createTable('user_activity_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
    
    // Add indexes
    await queryInterface.addIndex('user_activity_logs', ['user_id', 'created_at']);
    await queryInterface.addIndex('user_activity_logs', ['action', 'created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('user_activity_logs');
    await queryInterface.dropTable('schema_migrations');
  }
};