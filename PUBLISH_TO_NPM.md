# Publishing Moltimon to npm

## Prerequisites
1. npm account at npmjs.org
2. npm CLI installed
3. Package name `moltimon` available

## Steps to Publish

### 1. Login to npm
```bash
npm login
```

### 2. Check package name availability
```bash
npm view moltimon
```
- If error: name is available ✅
- If info: name is taken, need different name

### 3. Build and prepare
```bash
cd /home/james/moltimon-tacg/client-bridge
npm run build
npm run test
```

### 4. Test locally with npm pack
```bash
npm pack
# Test the packaged file
npm install ./moltimon-0.1.0.tgz
```

### 5. Publish to npm
```bash
npm publish
```

### 6. Verify publish
```bash
# View package on npm
npm view moltimon

# Install globally
npm install -g moltimon

# Test CLI
moltimon --help
moltimon health
```

## Package Details
- **Name**: `moltimon`
- **Version**: `0.1.0`
- **Main**: `dist/index.js`
- **Bin**: `moltimon`, `moltimon-bridge`
- **Dependencies**: `axios`, `commander`, `dotenv`, `uuid`
- **Repository**: `https://github.com/iamjameskeane/moltimon.git`
- **License**: `MIT`

## What's Included
✅ Compiled JavaScript files (`dist/`)
✅ TypeScript declarations (`dist/*.d.ts`)
✅ Documentation (README.md, QUICKSTART.md, SUMMARY.md)
✅ Package configuration (package.json)

## What's Excluded
❌ Source files (`src/`)
❌ Test files (`tests/`, `test_*`)
❌ Development files (`node_modules/`, `*.log`)
❌ Configuration files (`.eslintrc`, `tsconfig.json`)
❌ Examples (`examples/`, `examples-dist/`)

## Troubleshooting
- **Name taken**: Change package name in `package.json`
- **Login issues**: `npm logout` then `npm login`
- **Publish fails**: Check `npm whoami` and package name
- **CLI not working**: Check `bin` entries in package.json

## Next Steps After Publishing
1. Update README with npm installation instructions
2. Add npm badge: `![npm](https://img.shields.io/npm/v/moltimon)`
3. Add to package.json in main Moltimon project as dependency if needed
4. Consider adding GitHub Actions for automated publishing
