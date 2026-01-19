// tools/snapshot/post-commit-snapshot.mjs
// Cross-platform post-commit snapshot generator (Code Repo only)

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function sh(cmd, opts = {}) {
    try {
        return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
    } catch (e) {
        const stderr = (e?.stderr?.toString?.() || "").trim();
        const stdout = (e?.stdout?.toString?.() || "").trim();
        return { error: true, cmd, stdout, stderr };
    }
}

function existsCmd(cmd) {
    const r = spawnSync(cmd, ["--version"], { encoding: "utf8" });
    return r.status === 0;
}

function readJson(p) {
    try {
        return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch {
        return null;
    }
}

function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function nowYYYYMM() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
}

function shortSha() {
    const r = sh("git rev-parse --short HEAD");
    return typeof r === "string" ? r : "unknown";
}

function headSubject() {
    const r = sh("git log -1 --pretty=%s");
    return typeof r === "string" ? r : "(unknown)";
}

function branchName() {
    const r = sh("git rev-parse --abbrev-ref HEAD");
    return typeof r === "string" ? r : "(unknown)";
}

function statusPorcelain() {
    const r = sh("git status --porcelain");
    return typeof r === "string" ? r : "";
}

function changedFilesHead() {
    const r = sh("git show --name-only --pretty=format: HEAD");
    if (typeof r !== "string") return [];
    return r
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
}

function diffStatHead() {
    const r = sh("git show --stat --oneline -1");
    return typeof r === "string" ? r : "(diff stat unavailable)";
}

function diffPatchHeadLimit(maxLines = 120) {
    const r = sh("git show -1 --pretty=format:");
    if (typeof r !== "string") return "(diff unavailable)";
    const lines = r.split("\n");
    // 取前 N 行，避免 snapshot 太大
    return lines.slice(0, maxLines).join("\n");
}

function loadConfig() {
    // 可選：放在 repo root 的 .snapshotrc.json
    const cfg = readJson(path.resolve(".snapshotrc.json")) || {};
    return {
        runTypeCheck: cfg.runTypeCheck ?? false,
        typeCheckCmd: cfg.typeCheckCmd ?? "npm run type-check",
        runLint: cfg.runLint ?? false,
        lintCmd: cfg.lintCmd ?? "npm run lint",
        runTest: cfg.runTest ?? false,
        testCmd: cfg.testCmd ?? "npm test",
        runBuild: cfg.runBuild ?? false,
        buildCmd: cfg.buildCmd ?? "npm run build",
        uiScan: cfg.uiScan ?? true,
        uiScanPaths: cfg.uiScanPaths ?? ["apps", "src"],
        // 如果 rg 不存在，會改用 git grep（較弱）
    };
}

function runCmdWithOutput(label, cmd) {
    const r = sh(cmd);
    if (typeof r === "string") return { ok: true, label, cmd, out: r };
    return { ok: false, label, cmd, out: "", err: r.stderr || r.stdout || "unknown error" };
}

function uiScanWithRg(pathsToScan) {
    const items = [
        { title: "Button 分裂檢查", pattern: "GhostButton|btn-primary|btn-ghost|btn-danger|<button\\b" },
        { title: "原生 <select> 檢查", pattern: "<select\\b" },
        { title: "Typography 混用檢查（text-2xl/3xl/4xl）", pattern: "text-(2xl|3xl|4xl)" },
        { title: "Spacing 混用檢查（px-8/p-3/p-4 等）", pattern: "\\b(px-8|px-10|p-3|p-4|p-5)\\b" },
        { title: "硬編碼色碼檢查", pattern: "#[0-9a-fA-F]{3,8}|bg-\\[#|text-\\[#|border-\\[#" } // Tailwind arbitrary values
    ];

    const results = [];
    for (const it of items) {
        const cmd = `rg -n --no-heading "${it.pattern}" ${pathsToScan.map((p) => `"${p}"`).join(" ")}`;
        const r = sh(cmd);
        if (typeof r === "string" && r.length > 0) {
            // 限制行數避免爆量
            const lines = r.split("\n").slice(0, 80).join("\n");
            results.push({ title: it.title, cmd, hit: true, out: lines });
        } else {
            results.push({ title: it.title, cmd, hit: false, out: "" });
        }
    }
    return results;
}

function uiScanWithGitGrep() {
    const items = [
        { title: "Button 分裂檢查", pattern: "GhostButton\\|btn-primary\\|btn-ghost\\|btn-danger\\|<button" },
        { title: "原生 <select> 檢查", pattern: "<select" },
        { title: "Typography 混用檢查（text-2xl/3xl/4xl）", pattern: "text-2xl\\|text-3xl\\|text-4xl" },
        { title: "Spacing 混用檢查（px-8/p-3/p-4 等）", pattern: "px-8\\|px-10\\|p-3\\|p-4\\|p-5" },
        { title: "硬編碼色碼檢查", pattern: "#[0-9a-fA-F]\\{3,8\\}\\|bg-\\[#\\|text-\\[#\\|border-\\[#" }
    ];

    const results = [];
    for (const it of items) {
        const cmd = `git grep -n "${it.pattern}"`;
        const r = sh(cmd);
        if (typeof r === "string" && r.length > 0) {
            const lines = r.split("\n").slice(0, 80).join("\n");
            results.push({ title: it.title, cmd, hit: true, out: lines });
        } else {
            results.push({ title: it.title, cmd, hit: false, out: "" });
        }
    }
    return results;
}

function toMdSection(title, body) {
    return `\n## ${title}\n\n${body}\n`;
}

function main() {
    // guard: must be in git repo
    const inRepo = sh("git rev-parse --is-inside-work-tree");
    if (typeof inRepo !== "string" || inRepo !== "true") process.exit(0);

    const cfg = loadConfig();
    const yyyymm = nowYYYYMM();
    const sha = shortSha();
    const subj = headSubject();
    const branch = branchName();

    const outDir = path.resolve("context", "snapshots", yyyymm);
    ensureDir(outDir);

    const outPath = path.join(outDir, `code_HEAD_${sha}.md`);

    const files = changedFilesHead();
    const status = statusPorcelain();

    let md = `# Code Snapshot（HEAD）\n\n`;
    md += `- 產出時間：${new Date().toISOString()}\n`;
    md += `- Branch：\`${branch}\`\n`;
    md += `- Commit：\`${sha}\` ${subj}\n`;

    md += toMdSection(
        "A. 版本與提交資訊",
        [
            "```bash",
            "git rev-parse --abbrev-ref HEAD",
            "git log -1 --oneline",
            "git show --name-only --oneline -1",
            "git status --porcelain",
            "```",
            "",
            "**變更檔案（HEAD）**：",
            files.length ? files.map((f) => `- ${f}`).join("\n") : "-（無）",
            "",
            "**未提交狀態（porcelain）**：",
            "```",
            status || "(clean)",
            "```"
        ].join("\n")
    );

    md += toMdSection("B. Diff Stat（摘要）", `\n\`\`\`\n${diffStatHead()}\n\`\`\`\n`);

    md += toMdSection(
        "C. Diff Patch（前 120 行）",
        `\n\`\`\`diff\n${diffPatchHeadLimit(120)}\n\`\`\`\n`
    );

    // Optional: verification commands
    const ver = [];
    if (cfg.runTypeCheck) ver.push(runCmdWithOutput("type-check", cfg.typeCheckCmd));
    if (cfg.runLint) ver.push(runCmdWithOutput("lint", cfg.lintCmd));
    if (cfg.runTest) ver.push(runCmdWithOutput("test", cfg.testCmd));
    if (cfg.runBuild) ver.push(runCmdWithOutput("build", cfg.buildCmd));

    if (ver.length) {
        const blocks = ver
            .map((v) => {
                if (v.ok) {
                    return `### ${v.label}\n- 指令：\`${v.cmd}\`\n\n\`\`\`\n${v.out}\n\`\`\`\n`;
                }
                return `### ${v.label}\n- 指令：\`${v.cmd}\`\n- 結果：失敗（請見錯誤摘要）\n\n\`\`\`\n${v.err}\n\`\`\`\n`;
            })
            .join("\n");
        md += toMdSection("D. 驗證證據（可配置）", blocks);
    } else {
        md += toMdSection(
            "D. 驗證證據（可配置）",
            "- 本次未啟用自動驗證指令（可在 `.snapshotrc.json` 開啟）。"
        );
    }

    // Optional: UI scan
    if (cfg.uiScan) {
        const hasRg = existsCmd("rg");
        const scan = hasRg ? uiScanWithRg(cfg.uiScanPaths) : uiScanWithGitGrep();
        const scanMd = scan
            .map((s) => {
                const head = `### ${s.title}\n- 指令：\`${s.cmd}\`\n- 命中：${s.hit ? "是" : "否"}\n`;
                if (!s.hit) return `${head}\n`;
                return `${head}\n\`\`\`\n${s.out}\n\`\`\`\n`;
            })
            .join("\n");
        md += toMdSection("E. UI/UX 一致性掃描（可配置）", scanMd);
    } else {
        md += toMdSection("E. UI/UX 一致性掃描（可配置）", "- 本次未啟用 UI 掃描。");
    }

    // Experience Note reminder (not auto-writing content)
    md += toMdSection(
        "F. Experience Note（提醒）",
        [
            "- 建議：本次若為 UI/UX 或除錯修正，請由 Agent 依 `experience-depositor` 產出對應的經驗檔：",
            `  - \`/experience/${yyyymm}/code_${sha}_<keyword>.md\``,
            "- 本 snapshot 只做「證據收集與稽核輸出」，避免自動生成不精準的根因敘述。"
        ].join("\n")
    );

    fs.writeFileSync(outPath, md, "utf8");

    // Console hint for local logs
    // eslint-disable-next-line no-console
    console.log(`[snapshot] wrote ${outPath}`);
}

main();
