#!/bin/bash

# =============================================================================
# 开发部署快速命令设置脚本
# 用途：为用户设置便捷的开发部署命令别名
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检测shell类型
detect_shell() {
    if [ -n "$ZSH_VERSION" ]; then
        echo "zsh"
    elif [ -n "$BASH_VERSION" ]; then
        echo "bash"
    else
        echo "unknown"
    fi
}

# 获取配置文件路径
get_config_file() {
    local shell_type=$(detect_shell)
    case $shell_type in
        "zsh")
            echo "$HOME/.zshrc"
            ;;
        "bash")
            echo "$HOME/.bashrc"
            ;;
        *)
            echo "$HOME/.profile"
            ;;
    esac
}

# 创建别名配置
create_aliases() {
    local config_file=$(get_config_file)
    local project_path=$(pwd)
    
    log_info "设置开发部署快速命令..."
    log_info "配置文件: $config_file"
    log_info "项目路径: $project_path"
    
    # 备份原配置文件
    if [ -f "$config_file" ]; then
        cp "$config_file" "${config_file}.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "已备份原配置文件"
    fi
    
    # 添加别名到配置文件
    cat >> "$config_file" << EOF

# =============================================================================
# Lianyu AI 项目快速命令 (自动生成于 $(date))
# =============================================================================

# 项目路径
export LIANYU_PROJECT_PATH="$project_path"

# 快速进入项目目录
alias cdlianyu='cd "\$LIANYU_PROJECT_PATH"'

# Git 工作流程
alias gdev='git checkout -b feature/\$(date +%m%d)-'  # 创建功能分支: gdev new-feature
alias gfix='git checkout -b hotfix/\$(date +%m%d)-'  # 创建修复分支: gfix urgent-bug
alias gcommit='git add . && git commit -m'           # 快速提交: gcommit "feat: 添加新功能"
alias gpush='git push origin \$(git branch --show-current)'  # 推送当前分支
alias gpull='git pull origin main'                  # 拉取主分支
alias gstatus='git status --short'                  # 简洁状态显示
alias glog='git log --oneline -10'                  # 查看最近10次提交

# 代码质量检查
alias qcheck='cd "\$LIANYU_PROJECT_PATH" && ./quality-check.sh all'     # 全面质量检查
alias qsec='cd "\$LIANYU_PROJECT_PATH" && ./quality-check.sh security'  # 安全检查
alias qperf='cd "\$LIANYU_PROJECT_PATH" && ./quality-check.sh performance' # 性能检查

# 部署相关
alias deploy='cd "\$LIANYU_PROJECT_PATH" && git pull origin main && ./deploy-sync.sh'  # 完整部署
alias qdeploy='cd "\$LIANYU_PROJECT_PATH" && ./deploy-sync.sh --sync-only && ./deploy-sync.sh --restart-only'  # 快速部署
alias checkdeploy='cd "\$LIANYU_PROJECT_PATH" && ./deploy-sync.sh --validate-only'  # 验证部署
alias deploylog='ssh root@152.32.218.174 "cd /var/www/lianyu_ai && tail -f logs/app.log"'  # 查看部署日志

# 环境管理
alias envcheck='cd "\$LIANYU_PROJECT_PATH" && ./sync-env.sh --check'     # 检查环境差异
alias envprod='cd "\$LIANYU_PROJECT_PATH" && ./sync-env.sh production'   # 同步生产环境
alias envbackup='cd "\$LIANYU_PROJECT_PATH" && ./sync-env.sh --backup'   # 备份环境配置

# 开发服务器
alias devstart='cd "\$LIANYU_PROJECT_PATH/backend" && npm run dev'       # 启动开发服务器
alias devstop='pkill -f "node.*index.js"'                              # 停止开发服务器

# 服务器管理
alias sshserver='ssh root@152.32.218.174'                              # 连接服务器
alias serverstatus='ssh root@152.32.218.174 "ps aux | grep node"'      # 查看服务器进程
alias serverrestart='ssh root@152.32.218.174 "cd /var/www/lianyu_ai/backend && pkill -f node && nohup PORT=3001 node src/index.js > /dev/null 2>&1 &"'  # 重启服务器

# 完整工作流程
alias workflow='echo "\n🚀 Lianyu AI 开发工作流程:\n1. gdev <feature-name>  # 创建功能分支\n2. # 进行开发...\n3. qcheck               # 代码质量检查\n4. gcommit \"feat: 描述\"  # 提交代码\n5. gpush                # 推送分支\n6. # GitHub创建PR并合并\n7. gpull                # 拉取最新代码\n8. deploy               # 部署到服务器\n9. checkdeploy          # 验证部署\n"'

# 项目统计
alias projstats='cd "\$LIANYU_PROJECT_PATH" && echo "\n📊 项目统计:" && echo "代码文件数: \$(find . -name "*.js" -o -name "*.json" -o -name "*.md" | grep -v node_modules | wc -l)" && echo "总行数: \$(find . -name "*.js" | grep -v node_modules | xargs wc -l | tail -1)" && echo "Git提交数: \$(git rev-list --count HEAD)" && echo "分支数: \$(git branch -a | wc -l)"'

# 帮助信息
alias lianyuhelp='echo "\n🔧 Lianyu AI 快速命令帮助:\n\n📁 项目导航:\n  cdlianyu          - 进入项目目录\n\n🔄 Git工作流:\n  gdev <name>       - 创建功能分支\n  gfix <name>       - 创建修复分支\n  gcommit <msg>     - 快速提交\n  gpush             - 推送当前分支\n  gpull             - 拉取主分支\n  gstatus           - 查看状态\n  glog              - 查看提交历史\n\n🔍 代码质量:\n  qcheck            - 全面质量检查\n  qsec              - 安全检查\n  qperf             - 性能检查\n\n🚀 部署管理:\n  deploy            - 完整部署\n  qdeploy           - 快速部署\n  checkdeploy       - 验证部署\n  deploylog         - 查看日志\n\n🌍 环境管理:\n  envcheck          - 检查环境差异\n  envprod           - 同步生产环境\n  envbackup         - 备份配置\n\n💻 开发服务:\n  devstart          - 启动开发服务器\n  devstop           - 停止开发服务器\n\n🖥️  服务器管理:\n  sshserver         - 连接服务器\n  serverstatus      - 查看服务器状态\n  serverrestart     - 重启服务器\n\n📋 其他:\n  workflow          - 显示完整工作流程\n  projstats         - 项目统计信息\n  lianyuhelp        - 显示此帮助\n"'

EOF

    log_success "快速命令配置已添加到 $config_file"
}

# 创建快速启动脚本
create_quick_start() {
    local script_path="$HOME/bin/lianyu"
    
    # 创建目录
    mkdir -p "$HOME/bin"
    
    # 创建快速启动脚本
    cat > "$script_path" << EOF
#!/bin/bash
# Lianyu AI 项目快速启动脚本

PROJECT_PATH="$(pwd)"

case "\$1" in
    "dev")
        echo "🚀 启动开发环境..."
        cd "\$PROJECT_PATH/backend" && npm run dev
        ;;
    "deploy")
        echo "📦 开始部署..."
        cd "\$PROJECT_PATH"
        git pull origin main
        ./deploy-sync.sh
        ;;
    "check")
        echo "🔍 代码质量检查..."
        cd "\$PROJECT_PATH"
        ./quality-check.sh all
        ;;
    "status")
        echo "📊 项目状态..."
        cd "\$PROJECT_PATH"
        git status
        ./deploy-sync.sh --validate-only
        ;;
    "help"|"")
        echo "Lianyu AI 快速命令:"
        echo "  lianyu dev     - 启动开发环境"
        echo "  lianyu deploy  - 部署到服务器"
        echo "  lianyu check   - 代码质量检查"
        echo "  lianyu status  - 查看项目状态"
        echo "  lianyu help    - 显示帮助"
        ;;
    *)
        echo "未知命令: \$1"
        echo "使用 'lianyu help' 查看可用命令"
        ;;
esac
EOF

    chmod +x "$script_path"
    log_success "快速启动脚本已创建: $script_path"
    
    # 检查PATH
    if [[ ":$PATH:" != *":$HOME/bin:"* ]]; then
        log_warning "请将 $HOME/bin 添加到PATH环境变量"
        echo "export PATH=\"\$HOME/bin:\$PATH\"" >> $(get_config_file)
    fi
}

# 显示使用说明
show_usage() {
    echo "快速命令设置完成！"
    echo ""
    echo "🔄 重新加载配置:"
    echo "  source $(get_config_file)"
    echo ""
    echo "🚀 常用命令:"
    echo "  lianyuhelp    - 查看所有快速命令"
    echo "  workflow      - 查看开发工作流程"
    echo "  cdlianyu      - 快速进入项目目录"
    echo "  deploy        - 一键部署"
    echo "  qcheck        - 代码质量检查"
    echo ""
    echo "💡 提示: 使用 'lianyuhelp' 查看完整命令列表"
}

# 主函数
main() {
    log_info "开始设置 Lianyu AI 项目快速命令..."
    
    # 检查是否在项目目录
    if [ ! -f "deploy-sync.sh" ] || [ ! -f "quality-check.sh" ]; then
        log_error "请在 Lianyu AI 项目根目录下运行此脚本"
        exit 1
    fi
    
    # 创建别名
    create_aliases
    
    # 创建快速启动脚本
    create_quick_start
    
    # 显示使用说明
    show_usage
    
    log_success "快速命令设置完成！请运行 'source $(get_config_file)' 或重新打开终端"
}

# 执行主函数
main "$@"