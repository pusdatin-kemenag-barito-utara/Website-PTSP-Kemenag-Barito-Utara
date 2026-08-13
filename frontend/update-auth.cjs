const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk(path.join(__dirname, 'src/pages'), (err, files) => {
  if (err) throw err;
  let count = 0;
  files.forEach(file => {
    if (!file.endsWith('.astro')) return;
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.includes('requireAuth()')) {
      content = content.replace(/requireAuth\(\)/g, 'requireAuth(false, Astro)');
      changed = true;
    }
    
    if (content.includes('requireAuth(true)')) {
      content = content.replace(/requireAuth\(true\)/g, 'requireAuth(true, Astro)');
      changed = true;
    }
    
    if (content.includes('requireAuth(false)')) {
      content = content.replace(/requireAuth\(false\)/g, 'requireAuth(false, Astro)');
      changed = true;
    }
    
    if (content.includes('requireAdmin()')) {
      content = content.replace(/requireAdmin\(\)/g, 'requireAdmin(Astro)');
      changed = true;
    }
    
    if (content.match(/requirePermission\((['"`][a-zA-Z0-9_]+['"`])\)/)) {
      content = content.replace(/requirePermission\((['"`][a-zA-Z0-9_]+['"`])\)/g, 'requirePermission($1, Astro)');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(file, content);
      count++;
    }
  });
  console.log('Updated ' + count + ' .astro files');
});
