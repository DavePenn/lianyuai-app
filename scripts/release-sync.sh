#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REMOTE_HOST="${REMOTE_HOST:-152.32.218.174}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_PASSWORD="${REMOTE_PASSWORD:-daiyiping123}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/lianyu_ai}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
CURRENT_BRANCH="${CURRENT_BRANCH:-$(git branch --show-current)}"
DEFAULT_COMMIT_MESSAGE="chore: release sync $(date '+%Y-%m-%d %H:%M:%S')"
COMMIT_MESSAGE="${1:-$DEFAULT_COMMIT_MESSAGE}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROTECTED_PATHS=(
    ".env"
    ".env.development"
    ".env.production"
    "backend/.env"
    "backend/.env.development"
    "backend/.env.production"
    "DEVELOPMENT_ISSUES_LOG.md"
    "openclaw"
    "ios/App/App.xcworkspace/xcuserdata"
)

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

run_remote() {
    local cmd="$1"

    if [[ -n "$REMOTE_PASSWORD" ]]; then
        sshpass -p "$REMOTE_PASSWORD" ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "$cmd"
    else
        ssh -o StrictHostKeyChecking=no "$REMOTE_USER@$REMOTE_HOST" "$cmd"
    fi
}

run_rsync() {
    if [[ -n "$REMOTE_PASSWORD" ]]; then
        sshpass -p "$REMOTE_PASSWORD" rsync "$@"
    else
        rsync "$@"
    fi
}

check_dependencies() {
    local required_commands=("git" "rsync" "curl" "ssh")

    if [[ -n "$REMOTE_PASSWORD" ]]; then
        required_commands+=("sshpass")
    fi

    for command_name in "${required_commands[@]}"; do
        if ! command -v "$command_name" >/dev/null 2>&1; then
            log_error "缺少依赖: $command_name"
            exit 1
        fi
    done
}

check_protected_changes() {
    local protected_changes
    protected_changes="$(git status --porcelain -- "${PROTECTED_PATHS[@]}" || true)"

    if [[ -n "$protected_changes" ]]; then
        log_error "检测到受保护文件变更，已停止自动发布:"
        echo "$protected_changes"
        echo
        echo "请先手动确认这些文件是否应该进入发布流程。"
        exit 1
    fi
}

check_github_auth() {
    if ! git ls-remote "$GIT_REMOTE" -h HEAD >/dev/null 2>&1; then
        log_error "GitHub 认证失败，请先执行 ssh-add ~/.ssh/id_ed25519 或配置可用凭据。"
        exit 1
    fi
}

collect_repo_changes() {
    mapfile -t REPO_CHANGES < <(git status --porcelain)
}

commit_and_push_changes() {
    if [[ ${#REPO_CHANGES[@]} -eq 0 ]]; then
        log_info "没有检测到本地代码变更，跳过 Git 提交与推送。"
        LAST_RELEASE_COMMIT=""
        return
    fi

    log_info "暂存本地变更..."
    git add -A

    if git diff --cached --quiet; then
        log_info "没有可提交的暂存内容。"
        LAST_RELEASE_COMMIT=""
        return
    fi

    log_info "创建提交: $COMMIT_MESSAGE"
    git commit -m "$COMMIT_MESSAGE"
    LAST_RELEASE_COMMIT="$(git rev-parse HEAD)"

    check_github_auth

    log_info "推送到 GitHub: $GIT_REMOTE/$CURRENT_BRANCH"
    git push "$GIT_REMOTE" "$CURRENT_BRANCH"
    log_success "GitHub 推送完成: ${LAST_RELEASE_COMMIT:0:7}"
}

collect_release_files() {
    if [[ -z "$LAST_RELEASE_COMMIT" ]]; then
        CHANGED_FILES=()
        DELETED_FILES=()
        BACKEND_CHANGED=0
        return
    fi

    mapfile -t CHANGED_FILES < <(git diff-tree --no-commit-id --diff-filter=ACMRTUX --name-only -r "$LAST_RELEASE_COMMIT")
    mapfile -t DELETED_FILES < <(git diff-tree --no-commit-id --diff-filter=D --name-only -r "$LAST_RELEASE_COMMIT")

    BACKEND_CHANGED=0
    for path in "${CHANGED_FILES[@]}"; do
        if [[ "$path" == backend/* ]]; then
            BACKEND_CHANGED=1
            break
        fi
    done
}

sync_changed_files() {
    if [[ -z "$LAST_RELEASE_COMMIT" ]]; then
        log_info "没有新提交，跳过服务器同步。"
        return
    fi

    if [[ ${#CHANGED_FILES[@]} -eq 0 && ${#DELETED_FILES[@]} -eq 0 ]]; then
        log_warning "提交中没有可同步的文件变更。"
        return
    fi

    log_info "同步变更到服务器: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"

    if [[ ${#CHANGED_FILES[@]} -gt 0 ]]; then
        run_rsync -avz --relative "${CHANGED_FILES[@]}" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
    fi

    if [[ ${#DELETED_FILES[@]} -gt 0 ]]; then
        for deleted_path in "${DELETED_FILES[@]}"; do
            run_remote "rm -rf '$REMOTE_PATH/$deleted_path'"
        done
    fi

    log_success "服务器文件同步完成"
}

restart_backend_if_needed() {
    if [[ "$BACKEND_CHANGED" -ne 1 ]]; then
        return
    fi

    log_info "检测到后端变更，重启远程后端服务..."
    run_remote "pkill -f 'node src/index.js' || true"
    sleep 2
    run_remote "cd '$REMOTE_PATH/backend' && nohup node src/index.js > backend.log 2>&1 < /dev/null &"
    sleep 3
}

verify_frontend() {
    log_info "验证前端页面..."
    curl -sS --max-time 10 -I "http://$REMOTE_HOST" >/dev/null
    log_success "前端页面可访问: http://$REMOTE_HOST"
}

verify_backend() {
    if [[ "$BACKEND_CHANGED" -ne 1 ]]; then
        return
    fi

    log_info "验证后端健康检查..."

    local backend_ports=("3000" "3001")
    local healthy_port=""

    for port in "${backend_ports[@]}"; do
        if curl -sS --max-time 10 "http://$REMOTE_HOST:$port/api/health" >/dev/null 2>&1; then
            healthy_port="$port"
            break
        fi
    done

    if [[ -z "$healthy_port" ]]; then
        log_error "远程后端健康检查失败，请检查 $REMOTE_PATH/backend/backend.log"
        exit 1
    fi

    log_success "后端健康检查通过: http://$REMOTE_HOST:$healthy_port/api/health"
}

show_summary() {
    echo
    log_success "发布流程完成"
    echo "  Git 分支: $CURRENT_BRANCH"
    if [[ -n "$LAST_RELEASE_COMMIT" ]]; then
        echo "  Git 提交: ${LAST_RELEASE_COMMIT:0:7}"
    fi
    echo "  前端地址: http://$REMOTE_HOST"
    if [[ "$BACKEND_CHANGED" -eq 1 ]]; then
        echo "  后端健康检查: http://$REMOTE_HOST:3000/api/health 或 http://$REMOTE_HOST:3001/api/health"
    fi
}

show_help() {
    cat <<EOF
用法:
  ./scripts/release-sync.sh
  ./scripts/release-sync.sh "feat: your commit message"

说明:
  1. 检查敏感文件是否被误改
  2. 自动提交并推送到 GitHub
  3. 仅同步本次提交变更到服务器
  4. 如果包含 backend/ 变更，则自动重启后端并验活
EOF
}

main() {
    if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
        show_help
        exit 0
    fi

    check_dependencies
    check_protected_changes
    collect_repo_changes
    commit_and_push_changes
    collect_release_files
    sync_changed_files
    restart_backend_if_needed
    verify_frontend
    verify_backend
    show_summary
}

main "$@"
