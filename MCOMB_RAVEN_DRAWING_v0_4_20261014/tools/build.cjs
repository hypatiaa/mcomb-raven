const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve(__dirname, '..');
const rd = f => fs.readFileSync(path.join(root, f), 'utf8');
let html = rd('src/index.html');
html = html.replace('/*STYLE*/', () => rd('src/style.css'))
           .replace('/*DATA*/', () => rd('data/raven-exact-v042.js'))
           .replace('/*APP*/', () => rd('src/app.js'));
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/mcomb-raven-exact.html'), html);
const files = ['dist/mcomb-raven-exact.html', 'src/index.html', 'src/style.css', 'src/app.js', 'data/raven-exact-v042.js',
  'tools/build.cjs', 'tools/check.cjs', 'tools/fs_check.cjs', 'tools/owner_check.cjs', 'EXPLAINER.md', 'tools/export_exact_data_v042.py', 'tools/trace_common.py', 'README.md'];
const lines = files.filter(f => fs.existsSync(path.join(root, f))).map(f =>
  crypto.createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex') + '  ' + f);
fs.writeFileSync(path.join(root, 'dist/MANIFEST.sha256'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
