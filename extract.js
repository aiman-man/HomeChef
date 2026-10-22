const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const SRC_DIR = path.join(__dirname, 'src');
const EN_JSON_PATH = path.join(__dirname, 'src', 'locales', 'en.json');

let enTranslations = {};
let totalExtracted = 0;
let modifiedFilesCount = 0;

// Load existing en.json if available
if (fs.existsSync(EN_JSON_PATH)) {
  enTranslations = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf8'));
}

function toSnakeCase(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);
}

function getOrCreateKey(text) {
  const cleanText = text.trim();
  if (!cleanText || /^\d+$/.test(cleanText)) return null;

  for (const [key, val] of Object.entries(enTranslations)) {
    if (val === cleanText) return key;
  }

  let key = toSnakeCase(cleanText);
  if (!key) key = 'str_' + Math.random().toString(36).substring(2, 7);

  let originalKey = key;
  let counter = 1;
  while (enTranslations[key] && enTranslations[key] !== cleanText) {
    key = `${originalKey}_${counter++}`;
  }

  enTranslations[key] = cleanText;
  totalExtracted++;
  return key;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else if (/\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const files = walkDir(SRC_DIR);

files.forEach((filePath) => {
  const code = fs.readFileSync(filePath, 'utf8');
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
  } catch (err) {
    console.error(`Gagal memproses AST untuk: ${filePath}`);
    return;
  }

  let fileChanged = false;

  traverse(ast, {
    // 1. Ekstrak teks dalam JSX: <Text>Hello</Text>
    JSXText(path) {
      const text = path.node.value.trim();
      if (text && !/^\d+$/.test(text)) {
        const key = getOrCreateKey(text);
        if (key) {
          path.replaceWith(
            t.jsxExpressionContainer(
              t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
            )
          );
          fileChanged = true;
        }
      }
    },

    // 2. Ekstrak Prop JSX: placeholder="Enter email", title="Save", label="Name"
    JSXAttribute(path) {
      const attrName = path.node.name.name;
      if (['placeholder', 'title', 'label'].includes(attrName)) {
        if (t.isStringLiteral(path.node.value)) {
          const text = path.node.value.value;
          const key = getOrCreateKey(text);
          if (key) {
            path.node.value = t.jsxExpressionContainer(
              t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
            );
            fileChanged = true;
          }
        }
      }
    },

    // 3. Ekstrak Alert.alert("Title", "Message")
    CallExpression(path) {
      if (
        t.isMemberExpression(path.node.callee) &&
        path.node.callee.object.name === 'Alert' &&
        path.node.callee.property.name === 'alert'
      ) {
        path.node.arguments.forEach((arg, index) => {
          if (t.isStringLiteral(arg)) {
            const key = getOrCreateKey(arg.value);
            if (key) {
              path.node.arguments[index] = t.callExpression(t.identifier('t'), [
                t.stringLiteral(key),
              ]);
              fileChanged = true;
            }
          }
        });
      }
    },
  });

  if (fileChanged) {
    const output = generate(ast, {}, code);
    fs.writeFileSync(filePath, output.code, 'utf8');
    modifiedFilesCount++;
    console.log(`[Dikemas kini] ${path.relative(__dirname, filePath)}`);
  }
});

// Simpan en.json
const localesDir = path.dirname(EN_JSON_PATH);
if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir, { recursive: true });
fs.writeFileSync(EN_JSON_PATH, JSON.stringify(enTranslations, null, 2), 'utf8');

console.log('\n--- RINGKASAN EKSTRAKSI ---');
console.log(`Jumlah teks diekstrak: ${totalExtracted}`);
console.log(`Jumlah fail diubah: ${modifiedFilesCount}`);
console.log(`Fail en.json disimpan di: ${EN_JSON_PATH}`);