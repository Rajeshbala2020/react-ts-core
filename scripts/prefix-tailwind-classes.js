/**
 * Prefix bare Tailwind utility classes with `qbs-` so they don't clash with
 * consumer app Tailwind. Skips classes that already use `qbs-` / custom names.
 */
const fs = require('fs');
const path = require('path');

const PREFIX = 'qbs-';
const root = path.resolve(__dirname, '..');
const srcRoot = path.join(root, 'src');

const NEVER_PREFIX = new Set([
  'badge',
  'label-code',
  'suggestion-text',
  'text-common',
  'text-grey-secondary',
  'text-text-primary',
  'text-error',
  'textfield',
  'textfield-big',
  'textfield-error',
  'textfield-big-error',
  'textfield-success',
  'textfield-text-prefix',
  'tooltip',
  'tooltip-container',
  'tooltip-info',
  'tooltiptext',
  'custom_tooltip_style_class',
  'custom-spinner',
  'down',
  'up',
  'is-selected',
  'autocomplete-suggections',
  'autocomplete-suggections-tableview',
  'otp-input-customstyle',
]);

const SINGLE_WORD_TW = new Set([
  'absolute',
  'relative',
  'static',
  'fixed',
  'sticky',
  'block',
  'inline',
  'flex',
  'grid',
  'hidden',
  'visible',
  'invisible',
  'truncate',
  'container',
  'contents',
  'italic',
  'underline',
  'grow',
  'shrink',
  'border',
  'outline',
  'ring',
  'shadow',
  'transition',
  'transform',
  'filter',
  'uppercase',
  'lowercase',
  'capitalize',
  'truncate',
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'generated') continue;
      walk(full, files);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function collectCustomClassesFromCss() {
  const dir = path.join(root, 'src/styles/components');
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.css')) continue;
    const css = fs.readFileSync(path.join(dir, file), 'utf8');
    for (const match of css.matchAll(/\.(-?[a-zA-Z_][a-zA-Z0-9_-]*)/g)) {
      NEVER_PREFIX.add(match[1]);
    }
  }
}

function prefixToken(token) {
  if (!token || /\$\{|[{}]/.test(token)) return token;

  let important = false;
  let value = token;
  if (value.startsWith('!')) {
    important = true;
    value = value.slice(1);
  }

  const parts = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '[') depth++;
    if (ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ':' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current);

  const utility = parts.pop();
  if (!utility) return token;

  if (
    utility.startsWith(PREFIX) ||
    utility.startsWith(`-${PREFIX}`) ||
    NEVER_PREFIX.has(utility)
  ) {
    return token;
  }

  const isArbitrary = utility.includes('[');
  const hasDash = utility.includes('-');
  if (!isArbitrary && !hasDash && !SINGLE_WORD_TW.has(utility)) {
    return token;
  }

  const prefixedUtility = utility.startsWith('-')
    ? `-${PREFIX}${utility.slice(1)}`
    : `${PREFIX}${utility}`;

  const result = [...parts, prefixedUtility].join(':');
  return important ? `!${result}` : result;
}

function prefixClassString(classStr) {
  return classStr
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(prefixToken)
    .join(' ');
}

function prefixTemplateBody(body) {
  return body
    .split(/(\$\{[\s\S]*?\})/)
    .map((part) => {
      if (part.startsWith('${')) return part;
      const leading = part.match(/^\s*/)?.[0] ?? '';
      const trailing = part.match(/\s*$/)?.[0] ?? '';
      const core = part.trim();
      if (!core) return part;
      return leading + prefixClassString(core) + trailing;
    })
    .join('');
}

function transformContent(content) {
  let changed = false;

  let out = content.replace(
    /(className|class)\s*=\s*\{\s*(`[^`]*`|'[^']*'|"[^"]*")\s*\}/g,
    (full, attr, quoted) => {
      const quote = quoted[0];
      const body = quoted.slice(1, -1);
      const nextBody =
        quote === '`' ? prefixTemplateBody(body) : prefixClassString(body);
      if (nextBody !== body) changed = true;
      return `${attr}={${quote}${nextBody}${quote}}`;
    }
  );

  out = out.replace(
    /(className|class)\s*=\s*("([^"]*)"|'([^']*)')/g,
    (full, attr, quoted, d, s) => {
      const body = d ?? s ?? '';
      const q = quoted[0];
      const prefixed = prefixClassString(body);
      if (prefixed !== body) changed = true;
      return `${attr}=${q}${prefixed}${q}`;
    }
  );

  // Ternaries / concatenations: "flex items-center" style string literals
  out = out.replace(/('([^']*)'|"([^"]*)")/g, (full, _q, s, d) => {
    const body = s ?? d ?? '';
    const quote = full[0];
    if (!body || body.includes('/') || body.includes('.css')) return full;
    if (
      !/\b(flex|hidden|absolute|relative|block|inline|truncate|grid|w-|h-|m[trblxy]?-|p[trblxy]?-|text-|bg-|border|rounded|gap-|items-|justify-|z-|top-|left-|right-|bottom-|min-|max-|overflow-|shadow|cursor-|pointer-events|outline-|ring-|opacity-|whitespace-|leading-|font-|self-|col-|row-|basis-|grow|shrink|order-|inset-|start-|end-|me-|ms-|pe-|ps-|space-|divide-|from-|via-|to-|animate-|transition|duration-|ease-|delay-|scale-|rotate-|translate-|skew-|origin-|fill-|stroke-)/.test(
        body
      )
    ) {
      return full;
    }
    // Avoid transforming long prose / non-class strings
    if (body.length > 300) return full;
    const prefixed = prefixClassString(body);
    if (prefixed !== body) {
      changed = true;
      return `${quote}${prefixed}${quote}`;
    }
    return full;
  });

  return { out, changed };
}

collectCustomClassesFromCss();

const files = walk(srcRoot);
let changedCount = 0;
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const { out, changed } = transformContent(content);
  if (changed && out !== content) {
    fs.writeFileSync(file, out);
    changedCount++;
    console.log('updated', path.relative(root, file));
  }
}
console.log(`Prefixed Tailwind classes in ${changedCount} files`);
