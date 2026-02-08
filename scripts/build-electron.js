const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

function resolveSrcPlugin() {
  return {
    name: 'resolve-src',
    setup(build) {
      build.onResolve({ filter: /^\.\.\/src\// }, (args) => {
        const rel = args.path.replace(/^\.\.\/src\//, '');
        const candidate = path.join(srcDir, rel);
        const withTs = candidate.endsWith('.ts') ? candidate : candidate + '.ts';
        const withTsx = candidate.endsWith('.tsx') ? candidate : candidate + '.tsx';
        if (fs.existsSync(withTs)) return { path: withTs };
        if (fs.existsSync(withTsx)) return { path: withTsx };
        return { path: candidate };
      });
      build.onResolve({ filter: /^@\// }, (args) => {
        const rel = args.path.replace(/^@\//, '');
        const candidate = path.join(srcDir, rel);
        const withTs = candidate.endsWith('.ts') ? candidate : candidate + '.ts';
        const withTsx = candidate.endsWith('.tsx') ? candidate : candidate + '.tsx';
        if (fs.existsSync(withTs)) return { path: withTs };
        if (fs.existsSync(withTsx)) return { path: withTsx };
        return { path: candidate };
      });
    },
  };
}

esbuild
  .build({
    entryPoints: [path.join(root, 'electron', 'main.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: path.join(root, 'electron', 'main.js'),
    external: ['electron', './config'],
    plugins: [resolveSrcPlugin()],
  })
  .then(() => console.log('Electron main built to electron/main.js'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
