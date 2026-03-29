#!/bin/bash

# 🛡️ 災難復原腳本 - Review Quickly 評論助手
# 由世界級資安專家團隊設計

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
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

# 檢查Git狀態
check_git_status() {
    log_info "檢查Git狀態..."
    if ! git status &>/dev/null; then
        log_error "這不是一個Git倉庫！"
        exit 1
    fi
    
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "工作目錄有未提交的變更"
        git status --short
        return 1
    fi
    
    log_success "Git狀態正常"
    return 0
}

# 創建備份點
create_backup() {
    local backup_name=${1:-"auto-backup-$(date +%Y%m%d-%H%M%S)"}
    
    log_info "創建備份點: $backup_name"
    
    # 提交當前變更（如果有）
    if [ -n "$(git status --porcelain)" ]; then
        git add -A
        git commit -m "🔄 自動備份: $backup_name

💾 系統狀態:
- 時間: $(date)
- 分支: $(git branch --show-current)
- 變更文件: $(git status --porcelain | wc -l)

🔒 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
    fi
    
    # 創建備份分支
    local backup_branch="backup/$backup_name"
    git checkout -b "$backup_branch"
    git checkout main
    
    log_success "備份創建完成: $backup_branch"
    echo "$backup_branch" > .last-backup
}

# 列出所有備份
list_backups() {
    log_info "可用的備份點:"
    git branch | grep "backup/" | sed 's/^..//' | nl
}

# 一鍵回滾
rollback() {
    local backup_branch=${1:-"backup/stable-latest"}
    
    log_warning "準備回滾到: $backup_branch"
    
    # 檢查備份分支是否存在
    if ! git show-ref --verify --quiet refs/heads/$backup_branch; then
        log_error "備份分支不存在: $backup_branch"
        list_backups
        exit 1
    fi
    
    # 確認回滾
    read -p "確定要回滾嗎？這將丟失當前的所有未保存變更 [y/N]: " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "回滾已取消"
        exit 0
    fi
    
    # 保存當前狀態（如果有變更）
    if [ -n "$(git status --porcelain)" ]; then
        create_backup "emergency-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # 執行回滾
    log_info "執行回滾..."
    git reset --hard "$backup_branch"
    
    log_success "✅ 回滾完成！系統已恢復到穩定狀態"
}

# 健康檢查
health_check() {
    log_info "執行系統健康檢查..."
    
    local health_score=0
    local total_checks=4
    
    # 檢查 TypeScript
    log_info "檢查 TypeScript..."
    if npm run type-check &>/dev/null; then
        log_success "✅ TypeScript 類型檢查通過"
        ((health_score++))
    else
        log_error "❌ TypeScript 類型檢查失敗"
    fi
    
    # 檢查構建
    log_info "檢查項目構建..."
    if npm run build &>/dev/null; then
        log_success "✅ 項目構建成功"
        ((health_score++))
    else
        log_error "❌ 項目構建失敗"
    fi
    
    # 檢查依賴
    log_info "檢查依賴完整性..."
    if npm ls &>/dev/null; then
        log_success "✅ 依賴完整"
        ((health_score++))
    else
        log_warning "⚠️ 依賴可能有問題"
    fi
    
    # 檢查關鍵文件
    log_info "檢查關鍵文件..."
    local critical_files=("package.json" "src/main.tsx" "src/App.tsx" "tailwind.config.ts")
    local files_ok=true
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "缺少關鍵文件: $file"
            files_ok=false
        fi
    done
    
    if $files_ok; then
        log_success "✅ 關鍵文件完整"
        ((health_score++))
    fi
    
    # 健康評分
    local health_percentage=$(( health_score * 100 / total_checks ))
    
    if [ $health_percentage -ge 75 ]; then
        log_success "🎉 系統健康狀況良好 ($health_percentage%)"
    elif [ $health_percentage -ge 50 ]; then
        log_warning "⚠️ 系統健康狀況一般 ($health_percentage%)"
    else
        log_error "🚨 系統健康狀況不佳 ($health_percentage%)"
        log_warning "建議執行回滾操作"
    fi
}

# 自動修復嘗試
auto_fix() {
    log_info "嘗試自動修復常見問題..."
    
    # 清理node_modules
    if [ -d "node_modules" ]; then
        log_info "清理 node_modules..."
        rm -rf node_modules
        npm install
        log_success "依賴重新安裝完成"
    fi
    
    # 清理構建緩存
    if [ -d "dist" ]; then
        log_info "清理構建緩存..."
        rm -rf dist
    fi
    
    # 重新執行健康檢查
    health_check
}

# 顯示幫助
show_help() {
    echo "🛡️ 災難復原腳本 - Review Quickly 評論助手"
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  backup [name]     創建備份點"
    echo "  list             列出所有備份點"
    echo "  rollback [branch] 回滾到指定備份點"
    echo "  health           執行健康檢查"
    echo "  fix              嘗試自動修復"
    echo "  help             顯示此幫助"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 backup 'before-ui-changes'"
    echo "  $0 rollback backup/stable-latest"
    echo "  $0 health"
}

# 主函數
main() {
    case ${1:-help} in
        backup)
            create_backup "$2"
            ;;
        list)
            list_backups
            ;;
        rollback)
            rollback "$2"
            ;;
        health)
            health_check
            ;;
        fix)
            auto_fix
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 執行主函數
main "$@"