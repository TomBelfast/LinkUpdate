import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config({ path: '.env.local' });

async function addGitHubRepo() {
  let connection;
  
  try {
    console.log('=== ADDING GITHUB REPOSITORY ===');
    
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
    
    // Dane repozytorium ComfyUI-Easy-Install
    const comfyUIRepo = {
      user_id: userId,
      name: 'ComfyUI-Easy-Install',
      full_name: 'Tavris1/ComfyUI-Easy-Install',
      description: 'Easy installation script for ComfyUI on Windows with Nunchaku branch',
      html_url: 'https://github.com/Tavris1/ComfyUI-Easy-Install/tree/Windows-Nunchaku',
      clone_url: 'https://github.com/Tavris1/ComfyUI-Easy-Install.git',
      ssh_url: 'git@github.com:Tavris1/ComfyUI-Easy-Install.git',
      language: 'Python',
      stars_count: 0, // Będzie zaktualizowane przez API
      forks_count: 0,
      watchers_count: 0,
      size: 0,
      default_branch: 'Windows-Nunchaku',
      is_private: false,
      is_fork: true, // Prawdopodobnie fork
      is_archived: false,
      has_issues: true,
      has_projects: false,
      has_wiki: false,
      has_pages: false,
      license_name: null, // Będzie zaktualizowane przez API
      topics: 'comfyui,windows,installation,ai,stable-diffusion',
      github_created_at: '2024-01-01 00:00:00', // Będzie zaktualizowane przez API
      github_updated_at: '2024-12-01 00:00:00',
      github_pushed_at: '2024-12-01 00:00:00'
    };
    
    // Wstaw repozytorium
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
        html_url = VALUES(html_url),
        github_updated_at = VALUES(github_updated_at)
    `, [
      comfyUIRepo.user_id, comfyUIRepo.name, comfyUIRepo.full_name, comfyUIRepo.description,
      comfyUIRepo.html_url, comfyUIRepo.clone_url, comfyUIRepo.ssh_url, comfyUIRepo.language,
      comfyUIRepo.stars_count, comfyUIRepo.forks_count, comfyUIRepo.watchers_count,
      comfyUIRepo.size, comfyUIRepo.default_branch, comfyUIRepo.is_private, comfyUIRepo.is_fork,
      comfyUIRepo.is_archived, comfyUIRepo.has_issues, comfyUIRepo.has_projects,
      comfyUIRepo.has_wiki, comfyUIRepo.has_pages, comfyUIRepo.license_name, comfyUIRepo.topics,
      comfyUIRepo.github_created_at, comfyUIRepo.github_updated_at, comfyUIRepo.github_pushed_at
    ]);
    
    const repoId = insertResult.insertId || insertResult.affectedRows;
    console.log('✅ ComfyUI repository added/updated with ID:', repoId);
    
    // Dodaj tagi do repozytorium
    const tags = [
      { tag_name: 'ai-tools', color: '#ff6b6b' },
      { tag_name: 'comfyui', color: '#4ecdc4' },
      { tag_name: 'windows', color: '#45b7d1' },
      { tag_name: 'installation', color: '#96ceb4' }
    ];
    
    // Znajdź ID repozytorium jeśli było UPDATE
    let actualRepoId = repoId;
    if (insertResult.affectedRows > 0 && !insertResult.insertId) {
      const [repoResult] = await connection.execute(
        'SELECT id FROM github_repositories WHERE user_id = ? AND full_name = ?',
        [userId, comfyUIRepo.full_name]
      );
      if (repoResult.length > 0) {
        actualRepoId = repoResult[0].id;
      }
    }
    
    for (const tag of tags) {
      await connection.execute(`
        INSERT INTO github_repository_tags (repository_id, tag_name, color)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE color = VALUES(color)
      `, [actualRepoId, tag.tag_name, tag.color]);
    }
    console.log('✅ Repository tags added');
    
    // Dodaj notatkę do repozytorium
    await connection.execute(`
      INSERT INTO github_repository_notes (repository_id, user_id, title, content, is_pinned)
      VALUES (?, ?, ?, ?, ?)
    `, [
      actualRepoId, userId, 
      'ComfyUI Installation Notes',
      'Easy installation script for ComfyUI on Windows. Uses Windows-Nunchaku branch for better Windows compatibility. Great for setting up AI image generation workflow.',
      false
    ]);
    console.log('✅ Repository note added');
    
    // Sprawdź dodane repozytorium
    const [repos] = await connection.execute(`
      SELECT r.*, 
             GROUP_CONCAT(t.tag_name) as tags,
             COUNT(n.id) as notes_count
      FROM github_repositories r
      LEFT JOIN github_repository_tags t ON r.id = t.repository_id
      LEFT JOIN github_repository_notes n ON r.id = n.repository_id
      WHERE r.full_name = ?
      GROUP BY r.id
    `, [comfyUIRepo.full_name]);
    
    console.log('📊 Added repository:', repos[0]);
    
    console.log('🎉 ComfyUI repository added successfully!');
    
  } catch (error) {
    console.error('❌ Failed to add repository:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

addGitHubRepo();