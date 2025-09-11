class GitHubEmailQuery {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.hideLoading();
        this.hideError();
        this.renderHistory();
    }

    bindEvents() {
        document.getElementById('queryCommits').addEventListener('click', () => {
            this.queryCommits();
        });

        document.getElementById('queryApi').addEventListener('click', () => {
            this.persistToken();
            this.queryApi();
        });

        // 已移除一键聚合按钮

        // 支持回车键查询
        document.getElementById('repoUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.queryCommits();
            }
        });

        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.persistToken();
                this.queryApi();
            }
        });
    }

    persistToken() {
        try {
            const input = document.getElementById('token');
            if (input) {
                const value = (input.value || '').trim();
                if (value) {
                    localStorage.setItem('github_token', value);
                }
            }
        } catch (_) {}
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('error').style.display = 'flex';
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }

    // 方法一：通过项目commit记录查询邮箱
    async queryCommits() {
        const repoUrl = document.getElementById('repoUrl').value.trim();
        
        if (!repoUrl) {
            this.showError('请输入GitHub仓库地址');
            return;
        }

        if (!this.isValidGitHubUrl(repoUrl)) {
            this.showError('请输入有效的GitHub仓库地址，格式如：https://github.com/username/repository');
            return;
        }

        this.hideError();
        this.showLoading();
        document.getElementById('commitsResult').style.display = 'none';

        try {
            const emails = await this.fetchCommitsFromRepo(repoUrl);
            this.displayCommitsResult(emails);
            this.saveHistory({
                type: 'repo',
                input: repoUrl,
                count: Array.isArray(emails) ? emails.length : 0,
                top: Array.isArray(emails) && emails[0] ? emails[0].email : ''
            }, emails);
        } catch (error) {
            this.showError(`查询失败：${error.message}`);
        } finally {
            this.hideLoading();
            this.renderHistory();
        }
    }

    isValidGitHubUrl(url) {
        const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
        return githubRegex.test(url);
    }

    async fetchCommitsFromRepo(repoUrl) {
        // 从URL中提取用户名和仓库名
        const urlParts = repoUrl.replace('https://github.com/', '').split('/');
        const username = urlParts[0];
        const repoName = urlParts[1];

        // 使用GitHub API获取commits
        const apiUrl = `https://api.github.com/repos/${username}/${repoName}/commits?per_page=100`;

        const response = await fetch(apiUrl, { headers: this.getRequestHeaders() });

        if (!response.ok) {
            let detail = '';
            try {
                const errJson = await response.json();
                detail = errJson && errJson.message ? `：${errJson.message}` : '';
            } catch (_) {}
            if (response.status === 404) {
                throw new Error('仓库不存在或为私有仓库');
            } else if (response.status === 403) {
                throw new Error(this.getRateLimitHint(response, `API请求频率限制，请稍后再试${detail}`));
            } else {
                throw new Error(`API请求失败：${response.status}${detail}`);
            }
        }

        let commits = [];
        try {
            // 204 无内容时避免解析错误
            commits = response.status === 204 ? [] : await response.json();
        } catch (_) {
            commits = [];
        }
        return this.extractEmailsFromCommits(commits);
    }

    extractEmailsFromCommits(commits) {
        const emailMap = new Map();
        
        commits.forEach(commit => {
            const author = commit.commit.author;
            const committer = commit.commit.committer;
            
            // 提取作者邮箱
            if (author && author.email) {
                const email = author.email.toLowerCase();
                if (this.isValidEmail(email)) {
                    if (!emailMap.has(email)) {
                        emailMap.set(email, {
                            email: email,
                            name: author.name,
                            count: 0,
                            commits: []
                        });
                    }
                    emailMap.get(email).count++;
                    emailMap.get(email).commits.push({
                        hash: commit.sha.substring(0, 7),
                        message: commit.commit.message.split('\n')[0],
                        date: author.date
                    });
                }
            }

            // 提取提交者邮箱
            if (committer && committer.email) {
                const email = committer.email.toLowerCase();
                if (this.isValidEmail(email)) {
                    if (!emailMap.has(email)) {
                        emailMap.set(email, {
                            email: email,
                            name: committer.name,
                            count: 0,
                            commits: []
                        });
                    }
                    emailMap.get(email).count++;
                    emailMap.get(email).commits.push({
                        hash: commit.sha.substring(0, 7),
                        message: commit.commit.message.split('\n')[0],
                        date: committer.date
                    });
                }
            }
        });

        return Array.from(emailMap.values()).sort((a, b) => b.count - a.count);
    }

    displayCommitsResult(emails) {
        const resultDiv = document.getElementById('commitsResult');
        const contentDiv = document.getElementById('commitsContent');
        
        if (emails.length === 0) {
            contentDiv.innerHTML = '<div class="no-results">未找到有效的邮箱信息</div>';
        } else {
            let html = '';
            emails.forEach(emailData => {
                const isNoreply = emailData.email.includes('noreply') || emailData.email.includes('users.noreply');
                const iconClass = isNoreply ? 'fas fa-shield-alt' : 'fas fa-envelope';
                const emailClass = isNoreply ? 'email-address noreply-email' : 'email-address';
                const noreplyLabel = isNoreply ? '<span class="noreply-label">[GitHub隐私邮箱]</span>' : '';
                const latestTime = this.getLatestDateString(emailData.commits);
                const firstHash = (emailData.commits && emailData.commits.length > 0 && emailData.commits[0].hash) ? emailData.commits[0].hash : 'N/A';
                
                html += `
                    <div class="email-item ${isNoreply ? 'noreply-item' : ''}">
                        <i class="${iconClass}"></i>
                        <div class="email-info">
                            <div class="${emailClass}">${emailData.email} ${noreplyLabel}</div>
                            <div class="email-source">作者：${emailData.name}</div>
                            <div class="commit-info">
                                提交次数：${emailData.count} | 
                                最近提交：<span class="commit-hash">${firstHash}</span> | 最近提交时间：${latestTime}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-number">${emails.length}</div>
                        <div class="stat-label">邮箱</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${emails.reduce((sum, email) => sum + email.count, 0)}</div>
                        <div class="stat-label">总提交数</div>
                    </div>
                </div>
            `;

            contentDiv.innerHTML = html;
        }
        
        resultDiv.style.display = 'block';
    }

    // 方法二：通过GitHub API查询邮箱
    async queryApi() {
        const username = document.getElementById('username').value.trim();
        
        if (!username) {
            this.showError('请输入GitHub用户名');
            return;
        }

        this.hideError();
        this.showLoading();
        document.getElementById('apiResult').style.display = 'none';

        try {
            const emails = await this.fetchUserEvents(username);
            this.displayApiResult(emails);
            this.saveHistory({
                type: 'events',
                input: username,
                count: Array.isArray(emails) ? emails.length : 0,
                top: Array.isArray(emails) && emails[0] ? emails[0].email : ''
            }, emails);
        } catch (error) {
            this.showError(`查询失败：${error.message}`);
        } finally {
            this.hideLoading();
            this.renderHistory();
        }
    }

    // 历史记录：保存在 localStorage，仅本地，支持邮箱快照
    saveHistory(record, emails) {
        try {
            const list = JSON.parse(localStorage.getItem('gh_email_history') || '[]');
            const item = {
                time: new Date().toISOString(),
                type: record.type,
                input: record.input,
                count: record.count || 0,
                top: record.top || '',
                emails: Array.isArray(emails) ? emails.slice(0, 50).map(e => ({
                    email: e.email,
                    name: e.name,
                    count: e.count || 0
                })) : []
            };
            list.unshift(item);
            const trimmed = list.slice(0, 10);
            localStorage.setItem('gh_email_history', JSON.stringify(trimmed));
        } catch (_) {}
    }

    renderHistory() {
        try {
            const list = JSON.parse(localStorage.getItem('gh_email_history') || '[]');
            const box = document.getElementById('historyList');
            const empty = document.getElementById('historyEmpty');
            const content = document.getElementById('historyContent');
            if (!box || !content || !empty) return;
            if (!list.length) {
                box.style.display = 'none';
                empty.style.display = 'block';
                return;
            }
            empty.style.display = 'none';
            box.style.display = 'block';
            content.innerHTML = list.map((it, idx) => {
                const when = this.formatDate(it.time);
                const label = it.type === 'repo' ? '仓库' : '用户名';
                const top = it.top ? ` | 邮箱：${it.top}` : '';
                const emailsHtml = (it.emails || []).map(em => `
                    <div class=\"email-item\">
                        <i class=\"fas fa-envelope\"></i>
                        <div class=\"email-info\">
                            <div class=\"email-address\">${em.email}</div>
                            <div class=\"commit-info\">${em.name || ''} | 次数：${em.count}</div>
                        </div>
                    </div>
                `).join('');
                return `
                    <div class=\"email-item history-item\" data-idx=\"${idx}\">
                        <i class=\"fas fa-history\"></i>
                        <div class=\"email-info\">
                            <div class=\"email-address\">${label}：${it.input}</div>
                            <div class=\"commit-info\">时间：${when} | 邮箱数：${it.count}${top}</div>
                            <button class=\"btn\" data-action=\"toggle-history\" data-idx=\"${idx}\" style=\"margin-top:8px;\">查看邮箱</button>
                            <div id=\"history-detail-${idx}\" style=\"display:none;margin-top:10px;\">${emailsHtml || '<div class=\\"no-results\\">无邮箱快照</div>'}</div>
                        </div>
                    </div>
                `;
            }).join('');
            this.bindHistoryToggles();
        } catch (_) {}
    }

    // 历史“查看邮箱”展开/收起
    bindHistoryToggles() {
        try {
            const container = document.getElementById('historyContent');
            if (!container) return;
            container.addEventListener('click', (e) => {
                const target = e.target;
                if (target && target.getAttribute && target.getAttribute('data-action') === 'toggle-history') {
                    const idx = target.getAttribute('data-idx');
                    const panel = document.getElementById(`history-detail-${idx}`);
                    if (panel) {
                        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                    }
                }
            });
        } catch (_) {}
    }

    async fetchUserEvents(username) {
        const apiUrl = `https://api.github.com/users/${username}/events/public`;

        const response = await fetch(apiUrl, { headers: this.getRequestHeaders() });

        if (!response.ok) {
            let detail = '';
            try {
                const errJson = await response.json();
                detail = errJson && errJson.message ? `：${errJson.message}` : '';
            } catch (_) {}
            if (response.status === 404) {
                throw new Error('用户不存在');
            } else if (response.status === 403) {
                throw new Error(this.getRateLimitHint(response, `API请求频率限制，请稍后再试${detail}`));
            } else {
                throw new Error(`API请求失败：${response.status}${detail}`);
            }
        }

        let events = [];
        try {
            // 204 无内容时避免解析错误
            events = response.status === 204 ? [] : await response.json();
        } catch (_) {
            events = [];
        }
        return this.extractEmailsFromEvents(events, username);
    }

    // 统一请求头，支持本地 token 提升限额
    getRequestHeaders() {
        const headers = {
            'Accept': 'application/vnd.github+json'
        };
        try {
            const token = localStorage.getItem('github_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (_) {}
        return headers;
    }

    // Search commits 预览头（需要特殊 Accept）
    getSearchHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.cloak-preview'
        };
        try {
            const token = localStorage.getItem('github_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (_) {}
        return headers;
    }

    // 从响应头生成更友好的限流提示
    getRateLimitHint(response, fallbackMessage) {
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');
        const hasToken = !!(localStorage.getItem('github_token') || '').trim();
        let hint = fallbackMessage;
        if (reset) {
            const resetMs = Number(reset) * 1000;
            if (!Number.isNaN(resetMs)) {
                const when = this.formatDate(new Date(resetMs).toISOString());
                hint += `（重置时间：${when}）`;
            }
        }
        if (!hasToken) {
            hint += '。建议在下方 Token 输入框粘贴你的 GitHub Token 提升限额';
        }
        if (typeof remaining === 'string') {
            hint += `（剩余配额：${remaining}）`;
        }
        return hint;
    }

    extractEmailsFromEvents(events, username) {
        const emailMap = new Map();
        const target = (username || '').toLowerCase();
        
        events.forEach(event => {
            const actorLogin = event && event.actor && event.actor.login ? String(event.actor.login).toLowerCase() : '';
            if (target && actorLogin !== target) {
                return; // 仅保留由该用户触发的事件
            }
            // 检查push事件中的commits
            if (event.type === 'PushEvent' && event.payload && event.payload.commits) {
                event.payload.commits.forEach(commit => {
                    if (commit.author && commit.author.email) {
                        const email = commit.author.email.toLowerCase();
                        const authorName = (commit.author.name || '').toLowerCase();
                        // 事件已确认由该用户名触发，这里仅做邮箱有效性校验
                        if (this.isValidEmail(email)) {
                            if (!emailMap.has(email)) {
                                emailMap.set(email, {
                                    email: email,
                                    name: commit.author.name,
                                    count: 0,
                                    events: []
                                });
                            }
                            emailMap.get(email).count++;
                            emailMap.get(email).events.push({
                                type: 'Push',
                                repo: event.repo.name,
                                message: commit.message.split('\n')[0],
                                date: event.created_at
                            });
                        }
                    }
                });
            }
        });

        return Array.from(emailMap.values()).sort((a, b) => b.count - a.count);
    }

    // 使用 Search Commits API 按作者聚合邮箱（需要 Token 最佳）
    async fetchEmailsFromSearch(username) {
        const q = encodeURIComponent(`author:${username}`);
        const url = `https://api.github.com/search/commits?q=${q}&per_page=100&sort=author-date&order=desc`;
        const resp = await fetch(url, { headers: this.getSearchHeaders() });
        if (!resp.ok) {
            let detail = '';
            try {
                const err = await resp.json();
                detail = err && err.message ? `：${err.message}` : '';
            } catch (_) {}
            if (resp.status === 403) {
                throw new Error(this.getRateLimitHint(resp, `搜索提交受限${detail}`));
            }
            throw new Error(`搜索提交失败：${resp.status}${detail}`);
        }
        const data = await resp.json();
        const items = Array.isArray(data && data.items) ? data.items : [];
        const emailMap = new Map();
        items.forEach(item => {
            const c = item && item.commit ? item.commit : null;
            const author = c && c.author ? c.author : null;
            const committer = c && c.committer ? c.committer : null;
            const sha = item && item.sha ? item.sha : '';
            const message = c && c.message ? c.message.split('\n')[0] : '';
            const push = (author && author.email) ? { name: author.name, email: author.email, date: author.date } : null;
            const push2 = (committer && committer.email) ? { name: committer.name, email: committer.email, date: committer.date } : null;
            [push, push2].forEach(p => {
                if (!p || !p.email) return;
                const email = String(p.email).toLowerCase();
                const name = p.name || '';
                const date = p.date || '';
                if (!this.isValidEmail(email)) return;
                // 仅保留作者名或 users.noreply 中含用户名的邮箱
                const ok = this.emailBelongsToUsername(email, username.toLowerCase(), (name || '').toLowerCase());
                if (!ok) return;
                if (!emailMap.has(email)) {
                    emailMap.set(email, { email, name, count: 0, events: [], commits: [] });
                }
                const bucket = emailMap.get(email);
                bucket.name = bucket.name || name;
                bucket.count += 1;
                bucket.commits.push({ hash: sha.substring(0, 7), message, date });
            });
        });
        return Array.from(emailMap.values()).sort((a, b) => b.count - a.count);
    }

    // 判断邮箱/作者是否属于目标用户名（用于过滤Events中的无关邮箱）
    emailBelongsToUsername(email, targetUsername, authorName) {
        if (!targetUsername) return true;
        if (authorName && authorName === targetUsername) return true;
        if (email.endsWith('@users.noreply.github.com')) {
            const local = email.split('@')[0];
            if (local === targetUsername) return true;
            const plusIdx = local.indexOf('+');
            if (plusIdx !== -1) {
                const afterPlus = local.slice(plusIdx + 1);
                if (afterPlus === targetUsername) return true;
            }
        }
        return false;
    }

    displayApiResult(emails) {
        const resultDiv = document.getElementById('apiResult');
        const contentDiv = document.getElementById('apiContent');
        
        if (emails.length === 0) {
            contentDiv.innerHTML = '<div class="no-results">未找到邮箱信息</div>';
        } else {
            let html = '';
            emails.forEach(emailData => {
                const isNoreply = emailData.email.includes('noreply') || emailData.email.includes('users.noreply');
                const iconClass = isNoreply ? 'fas fa-shield-alt' : 'fas fa-envelope';
                const emailClass = isNoreply ? 'email-address noreply-email' : 'email-address';
                const noreplyLabel = isNoreply ? '<span class="noreply-label">[GitHub隐私邮箱]</span>' : '';
                const latestTime = this.getLatestDateString(emailData.events);
                const firstEventType = (emailData.events && emailData.events.length > 0 && emailData.events[0].type) ? emailData.events[0].type : 'N/A';
                
                html += `
                    <div class="email-item ${isNoreply ? 'noreply-item' : ''}">
                        <i class="${iconClass}"></i>
                        <div class="email-info">
                            <div class="${emailClass}">${emailData.email} ${noreplyLabel}</div>
                            <div class="email-source">用户：${emailData.name}</div>
                            <div class="commit-info">
                                活动次数：${emailData.count} | 
                                最近活动：${firstEventType} | 最近活动时间：${latestTime}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                <div class="stats">
                    <div class="stat-item">
                        <div class="stat-number">${emails.length}</div>
                        <div class="stat-label">邮箱</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${emails.reduce((sum, email) => sum + email.count, 0)}</div>
                        <div class="stat-label">总活动数</div>
                    </div>
                </div>
            `;

            contentDiv.innerHTML = html;
        }
        
        resultDiv.style.display = 'block';
    }

    // 将日期字符串格式化为本地可读格式
    formatDate(dateString) {
        if (!dateString) {
            return 'N/A';
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString;
        }
        return date.toLocaleString('zh-CN', {
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    // 获取一组对象中字段 date 的最新时间（已格式化）
    getLatestDateString(items) {
        if (!items || items.length === 0) {
            return 'N/A';
        }
        const validDates = items
            .map(item => item && item.date)
            .filter(Boolean);
        if (validDates.length === 0) {
            return 'N/A';
        }
        const latest = validDates.reduce((prev, curr) =>
            new Date(prev) > new Date(curr) ? prev : curr
        );
        return this.formatDate(latest);
    }

        //

    isValidEmail(email) {
        // 验证邮箱格式，但保留GitHub的noreply邮箱
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const lower = (email || '').toLowerCase();
        // 显示 users.noreply.github.com，但隐藏通用 noreply@github.com
        if (lower === 'noreply@github.com') {
            return false;
        }
        return emailRegex.test(email) && 
               lower !== 'null@null.com';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GitHubEmailQuery();
});
