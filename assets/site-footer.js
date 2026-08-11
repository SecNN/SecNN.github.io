(function () {
    'use strict';

    const script = document.currentScript;
    if (!script) return;

    const assetUrl = new URL(script.src, window.location.href);
    const siteRoot = new URL('../', assetUrl);
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('site-footer.css', assetUrl).href;
    document.head.appendChild(stylesheet);

    const path = window.location.pathname.toLowerCase();
    const securityRelated = /googlehacking|gitmailfinder|poc-exp|process|shell|tools\//.test(path);
    const notice = document.createElement('aside');
    notice.className = 'secnn-safety-notice';
    notice.setAttribute('aria-label', securityRelated ? '安全使用声明' : '使用说明');
    notice.innerHTML = securityRelated
        ? '<strong>安全使用声明：</strong>本工具仅用于合法、授权的安全测试、学习与防御研究。请勿处理无权访问的目标或数据；使用者应自行遵守所在地法律、目标服务条款及负责任披露规范。'
        : '<strong>使用说明：</strong>页面内容仅提供便捷工具与信息参考。请根据实际情况核对结果，并合理使用相关功能。';

    let footer = document.querySelector('footer');
    if (!footer) {
        footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
    footer.className = 'secnn-site-footer';
    footer.innerHTML = '';
    footer.parentNode.insertBefore(notice, footer);

    const year = new Date().getFullYear();
    footer.innerHTML = `
        <div class="secnn-site-footer__inner">
            <span>© 2023–${year} SecNN</span>
            <nav class="secnn-site-footer__links" aria-label="页脚导航">
                <a href="${new URL('index.html', siteRoot).href}">主页</a>
                <a href="${new URL('privacy/index.html', siteRoot).href}">隐私说明</a>
                <a href="https://github.com/SecNN" target="_blank" rel="noopener noreferrer">GitHub</a>
            </nav>
        </div>`;
})();
