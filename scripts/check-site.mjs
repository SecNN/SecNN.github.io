import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const excluded = new Set(['.git', 'AiScan-N', 'node_modules', 'POC-EXP']);
const errors = [];

function walk(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        if (excluded.has(entry.name)) return [];
        const absolute = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(absolute) : [absolute];
    });
}

const htmlFiles = walk(root).filter(file => /\.html?$/i.test(file));

for (const file of htmlFiles) {
    const relative = path.relative(root, file);
    if (relative === 'baidu_verify_codeva-8INkcX130t.html') continue;
    const html = fs.readFileSync(file, 'utf8');
    const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim();

    if (!/^<!doctype html>/i.test(html.trimStart())) errors.push(`${relative}: 缺少 HTML5 doctype`);
    if (!/<html[^>]+lang=["'][^"']+["']/i.test(html)) errors.push(`${relative}: 缺少 html lang`);
    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) errors.push(`${relative}: 缺少 viewport`);
    if (!title) errors.push(`${relative}: 缺少 title`);
    if (title && [...title].length > 60) errors.push(`${relative}: title 超过 60 个字符`);
    if (!/<meta[^>]+name=["']description["']/i.test(html)) errors.push(`${relative}: 缺少 description`);
    if (!/Content-Security-Policy/i.test(html)) errors.push(`${relative}: 缺少 CSP`);
    if (relative !== '404.html' && !/site-footer\.js/i.test(html)) errors.push(`${relative}: 未接入统一页脚`);

    for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
        const reference = match[1].trim();
        if (!reference || /^(?:[a-z]+:|\/\/|#|data:|javascript:)/i.test(reference) || reference.includes('${')) continue;
        const clean = decodeURIComponent(reference.split(/[?#]/)[0]);
        const target = clean.startsWith('/') ? path.join(root, clean) : path.resolve(path.dirname(file), clean);
        if (!fs.existsSync(target)) errors.push(`${relative}: 本地资源不存在 -> ${reference}`);
    }
}

if (fs.existsSync(path.join(root, 'redindex.html'))) errors.push('redindex.html: 文件应已删除');

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sponsor = fs.readFileSync(path.join(root, 'sponsor/sponsor.html'), 'utf8');
if (!/assets\/sponsors\.js/.test(home) || !/assets\/sponsors\.js/.test(sponsor)) {
    errors.push('主页和赞助页必须共同引用 assets/sponsors.js');
}

const gitMailScript = fs.readFileSync(path.join(root, 'GitMailFinder/script.js'), 'utf8');
if (/localStorage\.(?:getItem|setItem)\(['"]github_token/.test(gitMailScript)) {
    errors.push('GitMailFinder: GitHub Token 不应长期保存在 localStorage');
}

const toolSources = [
    fs.readFileSync(path.join(root, 'tools/index.html'), 'utf8'),
    fs.readFileSync(path.join(root, 'tools/jwt-tool.html'), 'utf8')
].join('\n');
if (/https:\/\/(?:cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net).*?(?:crypto-js|js-base64)/i.test(toolSources)) {
    errors.push('关键 CryptoJS/Base64 依赖必须使用本地副本');
}

if (errors.length) {
    console.error(`站点检查失败（${errors.length} 项）：`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
}

console.log(`站点检查通过：已检查 ${htmlFiles.length} 个 HTML 页面（已排除 AiScan-N 与 POC-EXP）。`);
