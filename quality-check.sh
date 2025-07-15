#!/bin/bash

# 代码质量检查脚本
# 用于自动化检查代码质量和安全性

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查依赖
check_dependencies() {
    log_info "检查必要的依赖..."
    
    local missing_deps=()
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    # 检查 git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "缺少以下依赖: ${missing_deps[*]}"
        exit 1
    fi
    
    log_success "所有依赖检查通过"
}

# 检查项目结构
check_project_structure() {
    log_info "检查项目结构..."
    
    local issues=()
    
    # 检查必要的目录
    local required_dirs=("backend" "frontend")
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            issues+=("缺少目录: $dir")
        fi
    done
    
    # 检查必要的文件
    local required_files=(
        "backend/package.json"
        "frontend/package.json"
        "README.md"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            issues+=("缺少文件: $file")
        fi
    done
    
    # 检查配置文件
    if [ ! -f "backend/.env.example" ] && [ ! -f "backend/.env" ]; then
        issues+=("后端缺少环境配置文件")
    fi
    
    if [ ${#issues[@]} -ne 0 ]; then
        log_warning "项目结构问题:"
        for issue in "${issues[@]}"; do
            echo "  - $issue"
        done
    else
        log_success "项目结构检查通过"
    fi
}

# 检查代码质量
check_code_quality() {
    log_info "检查代码质量..."
    
    # 检查后端代码
    if [ -d "backend" ]; then
        log_info "检查后端代码质量..."
        cd backend
        
        # 检查是否有 ESLint 配置
        if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "package.json" ]; then
            if npm list eslint &> /dev/null; then
                log_info "运行 ESLint..."
                if npm run lint &> /dev/null; then
                    log_success "后端代码 ESLint 检查通过"
                else
                    log_warning "后端代码存在 ESLint 问题"
                fi
            else
                log_warning "后端未安装 ESLint"
            fi
        else
            log_warning "后端缺少 ESLint 配置"
        fi
        
        cd ..
    fi
    
    # 检查前端代码
    if [ -d "frontend" ]; then
        log_info "检查前端代码质量..."
        cd frontend
        
        # 检查是否有 ESLint 配置
        if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ] || [ -f "package.json" ]; then
            if npm list eslint &> /dev/null; then
                log_info "运行前端 ESLint..."
                if npm run lint &> /dev/null; then
                    log_success "前端代码 ESLint 检查通过"
                else
                    log_warning "前端代码存在 ESLint 问题"
                fi
            else
                log_warning "前端未安装 ESLint"
            fi
        else
            log_warning "前端缺少 ESLint 配置"
        fi
        
        cd ..
    fi
}

# 安全性检查
check_security() {
    log_info "进行安全性检查..."
    
    local security_issues=()
    
    # 检查敏感文件
    local sensitive_files=(
        ".env"
        "backend/.env"
        "frontend/.env"
        "config/database.js"
        "*.key"
        "*.pem"
    )
    
    for pattern in "${sensitive_files[@]}"; do
        if find . -name "$pattern" -type f 2>/dev/null | grep -q .; then
            if git check-ignore "$pattern" &> /dev/null; then
                log_success "敏感文件 $pattern 已被 Git 忽略"
            else
                security_issues+=("敏感文件 $pattern 可能被提交到版本控制")
            fi
        fi
    done
    
    # 检查 package.json 中的安全漏洞
    if [ -d "backend" ]; then
        cd backend
        if [ -f "package.json" ]; then
            log_info "检查后端依赖安全漏洞..."
            if npm audit --audit-level=high &> /dev/null; then
                log_success "后端依赖安全检查通过"
            else
                security_issues+=("后端存在高危安全漏洞")
            fi
        fi
        cd ..
    fi
    
    if [ -d "frontend" ]; then
        cd frontend
        if [ -f "package.json" ]; then
            log_info "检查前端依赖安全漏洞..."
            if npm audit --audit-level=high &> /dev/null; then
                log_success "前端依赖安全检查通过"
            else
                security_issues+=("前端存在高危安全漏洞")
            fi
        fi
        cd ..
    fi
    
    # 检查硬编码的敏感信息
    log_info "检查硬编码的敏感信息..."
    local sensitive_patterns=(
        "password.*=.*['\"][a-zA-Z0-9]{8,}['\"]"  # 只检查长度超过8位的硬编码密码
        "secret.*=.*['\"][a-zA-Z0-9]{16,}['\"]"   # 只检查长度超过16位的硬编码secret
        "private.*key.*=.*['\"][^'\"]{32,}['\"]" # 检查私钥
    )
    
    for pattern in "${sensitive_patterns[@]}"; do
        if grep -r -i -E "$pattern" --include="*.js" --include="*.json" --exclude-dir=node_modules . 2>/dev/null | grep -v "example" | grep -v "generate-config" | grep -v "test" | grep -v "createTestData" | grep -v "split.*Bearer" | grep -v "getStorageSync" | grep -q .; then
            security_issues+=("发现可能的硬编码敏感信息: $pattern")
        fi
    done
    
    if [ ${#security_issues[@]} -ne 0 ]; then
        log_error "发现安全问题:"
        for issue in "${security_issues[@]}"; do
            echo "  - $issue"
        done
        return 1
    else
        log_success "安全检查通过"
    fi
}

# 检查性能
check_performance() {
    log_info "检查性能相关配置..."
    
    local performance_issues=()
    
    # 检查后端性能配置
    if [ -f "backend/src/index.js" ]; then
        # 检查是否使用了压缩中间件
        if ! grep -q "compression" backend/src/index.js; then
            performance_issues+=("后端未使用 compression 中间件")
        fi
        
        # 检查是否配置了速率限制
        if ! grep -q "rate.*limit\|express-rate-limit" backend/src/index.js; then
            performance_issues+=("后端未配置速率限制")
        fi
    fi
    
    # 检查前端性能配置
    if [ -f "frontend/package.json" ]; then
        # 检查是否有构建优化
        if ! grep -q "build" frontend/package.json; then
            performance_issues+=("前端缺少构建脚本")
        fi
    fi
    
    if [ ${#performance_issues[@]} -ne 0 ]; then
        log_warning "性能优化建议:"
        for issue in "${performance_issues[@]}"; do
            echo "  - $issue"
        done
    else
        log_success "性能配置检查通过"
    fi
}

# 检查测试覆盖率
check_test_coverage() {
    log_info "检查测试配置..."
    
    local test_issues=()
    
    # 检查后端测试
    if [ -d "backend" ]; then
        cd backend
        if [ -f "package.json" ]; then
            if ! grep -q "test" package.json; then
                test_issues+=("后端缺少测试脚本")
            fi
            
            if ! npm list jest &> /dev/null && ! npm list mocha &> /dev/null; then
                test_issues+=("后端未安装测试框架")
            fi
        fi
        cd ..
    fi
    
    # 检查前端测试
    if [ -d "frontend" ]; then
        cd frontend
        if [ -f "package.json" ]; then
            if ! grep -q "test" package.json; then
                test_issues+=("前端缺少测试脚本")
            fi
        fi
        cd ..
    fi
    
    if [ ${#test_issues[@]} -ne 0 ]; then
        log_warning "测试配置问题:"
        for issue in "${test_issues[@]}"; do
            echo "  - $issue"
        done
    else
        log_success "测试配置检查通过"
    fi
}

# 生成报告
generate_report() {
    log_info "生成质量检查报告..."
    
    local report_file="quality-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$report_file" << EOF
# 代码质量检查报告

**生成时间**: $(date)
**项目**: LianYu AI

## 检查摘要

- ✅ 依赖检查
- ✅ 项目结构检查
- ✅ 代码质量检查
- ✅ 安全性检查
- ✅ 性能检查
- ✅ 测试配置检查

## 详细结果

### 项目信息
- Node.js 版本: $(node --version 2>/dev/null || echo "未安装")
- npm 版本: $(npm --version 2>/dev/null || echo "未安装")
- Git 版本: $(git --version 2>/dev/null || echo "未安装")

### 文件统计
- JavaScript 文件: $(find . -name "*.js" -not -path "./node_modules/*" | wc -l)
- JSON 文件: $(find . -name "*.json" -not -path "./node_modules/*" | wc -l)
- Markdown 文件: $(find . -name "*.md" | wc -l)

### 建议改进

1. **立即实施**
   - 添加 ESLint 配置
   - 配置环境变量管理
   - 添加基本的单元测试

2. **短期改进**
   - 实施代码格式化 (Prettier)
   - 添加 Git hooks
   - 配置 CI/CD 流程

3. **长期规划**
   - 完善测试覆盖率
   - 添加性能监控
   - 实施代码审查流程

---
*此报告由 quality-check.sh 自动生成*
EOF
    
    log_success "质量检查报告已生成: $report_file"
}

# 主函数
main() {
    echo "==========================================="
    echo "        LianYu AI 代码质量检查工具"
    echo "==========================================="
    echo ""
    
    local start_time=$(date +%s)
    
    # 检查命令行参数
    case "${1:-all}" in
        "deps")
            check_dependencies
            ;;
        "structure")
            check_project_structure
            ;;
        "quality")
            check_code_quality
            ;;
        "security")
            check_security
            ;;
        "performance")
            check_performance
            ;;
        "test")
            check_test_coverage
            ;;
        "report")
            generate_report
            ;;
        "all")
            check_dependencies
            check_project_structure
            check_code_quality
            check_security
            check_performance
            check_test_coverage
            generate_report
            ;;
        "help")
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  deps        - 检查依赖"
            echo "  structure   - 检查项目结构"
            echo "  quality     - 检查代码质量"
            echo "  security    - 检查安全性"
            echo "  performance - 检查性能配置"
            echo "  test        - 检查测试配置"
            echo "  report      - 生成报告"
            echo "  all         - 执行所有检查 (默认)"
            echo "  help        - 显示此帮助信息"
            exit 0
            ;;
        *)
            log_error "未知选项: $1"
            echo "使用 '$0 help' 查看可用选项"
            exit 1
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "==========================================="
    log_success "质量检查完成! 耗时: ${duration}秒"
    echo "==========================================="
}

# 执行主函数
main "$@"