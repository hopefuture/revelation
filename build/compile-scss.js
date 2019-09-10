const {exec} = require('child_process');

function compileScss() {
  const project = process.argv[2] || 'sso';
  exec(`node-sass ${project}/sass/login.scss ${project}/css/login.css --watch`);
}

compileScss();
