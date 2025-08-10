import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config({ path: '.env.local' });

async function testGitHubTables() {
  let connection;
  
  try {
    console.log('=== TESTING GITHUB TABLES ===');
    
    const config = {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: parseInt(process.env.DATABASE_PORT)
    };
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');
    
    // Sprawdź czy użytkownik Tomasz istnieje
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      ['tomaszpasiekauk@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ User tomaszpasiekauk@gmail.com not found');
      return;
    }
    
    const userId = users[0].id;
    console.log('✅ Found user:', users[0]);
    
    // Dodaj przykładowe repozytorium
    const sampleRepo = {
      user_id: userId,
      name: 'my-awesome-project',
      full_name: 'tomaszpasiekauk/my-awesome-project',
      description: 'An awesome project built with React and Node.js',
      html_url: 'https://github.com/tomaszpasiekauk/my-awesome-project',
      clone_url: 'https://github.com/tomaszpasiekauk/my-awesome-project.git',
      ssh_url: 'git@github.com:tomaszpasiekauk/my-awesome-project.git',
      language: 'JavaScript',
      stars_count: 42,
      forks_count: 7,
      watchers_count: 15,
      size: 1024,
      default_branch: 'main',
      is_private: false,
      is_fork: false,
      is_archived: false,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      has_pages: false,
      license_name: 'MIT',
      topics: 'react,nodejs,javascript,web-development',
      github_created_at: '2024-01-15 10:30:00',
      github_updated_at: '2024-12-20 14:45:00',
      github_pushed_at: '2024-12-19 16:20:00'
    };
    
    // Wstaw przykładowe repozytorium
    const [insertResult] = await connection.execute(`
      INSERT INTO github_repositories (
        user_id, name, full_name, description, html_url, clone_url, ssh_url,
        language, stars_count, forks_count, watchers_count, size, default_branch,
        is_private, is_fork, is_archived, has_issues, has_projects, has_wiki,
        has_pages, license_name, topics, github_created_at, github_updated_at,
        github_pushed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        description = VALUES(description),
        stars_count = VALUES(stars_count),
        github_updated_at = VALUES(github_updated_at)
    `, [
      sampleRepo.user_id, sampleRepo.name, sampleRepo.full_name, sampleRepo.description,
      sampleRepo.html_url, sampleRepo.clone_url, sampleRepo.ssh_url, sampleRepo.language,
      sampleRepo.stars_count, sampleRepo.forks_count, sampleRepo.watchers_count,
      sampleRepo.size, sampleRepo.default_branch, sampleRepo.is_private, sampleRepo.is_fork,
      sampleRepo.is_archived, sampleRepo.has_issues, sampleRepo.has_projects,
      sampleRepo.has_wiki, sampleRepo.has_pages, sampleRepo.license_name, sampleRepo.topics,
      sampleRepo.github_created_at, sampleRepo.github_updated_at, sampleRepo.github_pushed_at
    ]);
    
    const repoId = insertResult.insertId;
    console.log('✅ Sample repository inserted with ID:', repoId);
    
    // Dodaj tagi do repozytorium
    const tags = [
      { repository_id: repoId, tag_name: 'frontend', color: '#61dafb' },
      { repository_id: repoId, tag_name: 'backend', color: '#68a063' },
      { repository_id: repoId, tag_name: 'important', color: '#ff6b6b' }
    ];
    
    for (const tag of tags) {
      await connection.execute(`
        INSERT INTO github_repository_tags (repository_id, tag_name, color)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE color = VALUES(color)
      `, [tag.repository_id, tag.tag_name, tag.color]);
    }
    console.log('✅ Repository tags added');
    
    // Dodaj notatkę do repozytorium
    await connection.execute(`
      INSERT INTO github_repository_notes (repository_id, user_id, title, content, is_pinned)
      VALUES (?, ?, ?, ?, ?)
    `, [
      repoId, userId, 
      'Development Notes',
      'Remember to update the README and add more tests before the next release.',
      true
    ]);
    console.log('✅ Repository note added');
    
    // Dodaj do ulubionych
    await connection.execute(`
      INSERT INTO github_favorite_repositories (user_id, repository_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE created_at = created_at
    `, [userId, repoId]);
    console.log('✅ Repository added to favorites');
    
    // Dodaj konfigurację GitHub
    await connection.execute(`
      INSERT INTO github_config (user_id, github_username, auto_sync, sync_interval_hours)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        github_username = VALUES(github_username),
        auto_sync = VALUES(auto_sync),
        sync_interval_hours = VALUES(sync_interval_hours)
    `, [userId, 'tomaszpasiekauk', true, 12]);
    console.log('✅ GitHub config added');
    
    // Sprawdź wszystkie dane
    console.log('\n=== VERIFICATION ===');
    
    const [repos] = await connection.execute(`
      SELECT r.*, 
             GROUP_CONCAT(t.tag_name) as tags,
             COUNT(n.id) as notes_count,
             CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as is_favorite
      FROM github_repositories r
      LEFT JOIN github_repository_tags t ON r.id = t.repository_id
      LEFT JOIN github_repository_notes n ON r.id = n.repository_id
      LEFT JOIN github_favorite_repositories f ON r.id = f.repository_id AND f.user_id = r.user_id
      WHERE r.user_id = ?
      GROUP BY r.id
    `, [userId]);
    
    console.log('📊 Repositories:', repos);
    
    const [githubConfig] = await connection.execute(
      'SELECT * FROM github_config WHERE user_id = ?',
      [userId]
    );
    console.log('⚙️ GitHub config:', githubConfig);
    
    console.log('🎉 All GitHub tables tested successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testGitHubTables();