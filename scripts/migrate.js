const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.development' });

async function main() {
  console.log('Connecting to database...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '192.168.0.250',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'test1',
    password: process.env.DB_PASSWORD || 'test1',
    database: process.env.DB_NAME || 'BOLT',
    multipleStatements: true
  });

  console.log('Connected. Running migrations...');

  const migrationSQL = `
    -- Creating projects table
    CREATE TABLE IF NOT EXISTS projects (
      id varchar(128) PRIMARY KEY,
      name varchar(255) NOT NULL,
      description text,
      status enum('ACTIVE', 'PAUSED', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
      priority enum('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
      color varchar(7),
      icon varchar(50),
      user_id varchar(128) NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Creating tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id varchar(128) PRIMARY KEY,
      description text NOT NULL,
      status enum('NEW', 'IN_PROGRESS', 'PENDING_FEEDBACK', 'COMPLETED') NOT NULL DEFAULT 'NEW',
      due_date timestamp NULL,
      project_id varchar(128) NOT NULL,
      user_id varchar(128) NOT NULL,
      assigned_to varchar(128),
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Creating ideas table
    CREATE TABLE IF NOT EXISTS ideas (
      id varchar(128) PRIMARY KEY,
      title varchar(255) NOT NULL,
      description text,
      status enum('DRAFT', 'ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
      tags text,
      user_id varchar(128) NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Creating resources table
    CREATE TABLE IF NOT EXISTS resources (
      id varchar(128) PRIMARY KEY,
      url varchar(2048) NOT NULL,
      title varchar(255) NOT NULL,
      description text,
      type enum('VIDEO', 'ARTICLE', 'TOOL', 'DATASET', 'OTHER') NOT NULL,
      project_id varchar(128) NOT NULL,
      user_id varchar(128) NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    -- Creating widget_configurations table
    CREATE TABLE IF NOT EXISTS widget_configurations (
      id varchar(128) PRIMARY KEY,
      user_id varchar(128) NOT NULL,
      widget_type varchar(50) NOT NULL,
      configuration text,
      position int NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
    CREATE INDEX IF NOT EXISTS idx_resources_project_id ON resources(project_id);
    CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
    CREATE INDEX IF NOT EXISTS idx_widget_configurations_user_id ON widget_configurations(user_id);
  `;

  try {
    await connection.query(migrationSQL);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main().catch(console.error); 