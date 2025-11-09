module.exports = {
  apps: [{
    name: 'link-app',
    script: 'node_modules/next/dist/bin/next',
    args: 'dev -p 8888 -H 0.0.0.0',
    cwd: '/link',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 8888
    },
    error_file: '/root/.pm2/logs/link-app-error.log',
    out_file: '/root/.pm2/logs/link-app-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};

