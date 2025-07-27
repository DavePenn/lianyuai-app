#!/usr/bin/env node
/**
 * 数据库维护脚本
 * 用于数据库备份、恢复、清理和维护操作
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 数据库连接配置
const dbConfig = {
  user: process.env.DB_USER || 'lianyu_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'lianyu_ai',
  password: process.env.DB_PASSWORD || 'lianyu_secure_password_2024',
  port: process.env.DB_PORT || 5432,
};

const pool = new Pool(dbConfig);

/**
 * 创建数据库备份
 * @param {string} backupPath - 备份文件路径
 * @param {Object} options - 备份选项
 */
async function createBackup(backupPath = null, options = {}) {
  try {
    const {
      format = 'custom', // custom, plain, tar, directory
      compress = true,
      dataOnly = false,
      schemaOnly = false,
      verbose = true
    } = options;
    
    if (!backupPath) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = format === 'plain' ? 'sql' : (format === 'tar' ? 'tar' : 'backup');
      backupPath = `./lianyu_ai_backup_${timestamp}.${extension}`;
    }
    
    console.log('🔄 开始创建数据库备份...');
    console.log(`📁 备份路径: ${backupPath}`);
    console.log(`📦 备份格式: ${format}`);
    
    // 构建 pg_dump 命令
    let command = 'pg_dump';
    
    // 添加连接参数
    command += ` -h ${dbConfig.host}`;
    command += ` -p ${dbConfig.port}`;
    command += ` -U ${dbConfig.user}`;
    command += ` -d ${dbConfig.database}`;
    
    // 添加格式参数
    command += ` -F ${format.charAt(0)}`; // c=custom, p=plain, t=tar, d=directory
    
    // 添加其他选项
    if (compress && format !== 'plain') {
      command += ' -Z 9'; // 最高压缩级别
    }
    
    if (dataOnly) {
      command += ' -a'; // 仅数据
    } else if (schemaOnly) {
      command += ' -s'; // 仅结构
    }
    
    if (verbose) {
      command += ' -v'; // 详细输出
    }
    
    // 添加输出文件
    if (format !== 'directory') {
      command += ` -f "${backupPath}"`;
    } else {
      command += ` -f "${backupPath}"`;
    }
    
    // 设置密码环境变量
    const env = { ...process.env, PGPASSWORD: dbConfig.password };
    
    console.log('⏳ 执行备份命令...');
    const { stdout, stderr } = await execAsync(command, { env });
    
    if (verbose && stderr) {
      console.log('📝 备份日志:');
      console.log(stderr);
    }
    
    // 检查备份文件是否创建成功
    if (format !== 'directory' && fs.existsSync(backupPath)) {
      const stats = fs.statSync(backupPath);
      console.log(`✅ 备份创建成功!`);
      console.log(`📊 文件大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } else if (format === 'directory' && fs.existsSync(backupPath)) {
      console.log(`✅ 目录备份创建成功!`);
    } else {
      throw new Error('备份文件未找到，备份可能失败');
    }
    
    return backupPath;
    
  } catch (error) {
    console.error('❌ 创建备份失败:', error.message);
    throw error;
  }
}

/**
 * 恢复数据库备份
 * @param {string} backupPath - 备份文件路径
 * @param {Object} options - 恢复选项
 */
async function restoreBackup(backupPath, options = {}) {
  try {
    const {
      clean = false,
      createDb = false,
      dataOnly = false,
      schemaOnly = false,
      verbose = true,
      noOwner = true,
      noPrivileges = true
    } = options;
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }
    
    console.log('🔄 开始恢复数据库备份...');
    console.log(`📁 备份文件: ${backupPath}`);
    
    // 检查备份文件格式
    const isPlainSql = backupPath.endsWith('.sql');
    
    let command;
    
    if (isPlainSql) {
      // 使用 psql 恢复 plain SQL 备份
      command = 'psql';
      command += ` -h ${dbConfig.host}`;
      command += ` -p ${dbConfig.port}`;
      command += ` -U ${dbConfig.user}`;
      command += ` -d ${dbConfig.database}`;
      command += ` -f "${backupPath}"`;
    } else {
      // 使用 pg_restore 恢复自定义格式备份
      command = 'pg_restore';
      command += ` -h ${dbConfig.host}`;
      command += ` -p ${dbConfig.port}`;
      command += ` -U ${dbConfig.user}`;
      command += ` -d ${dbConfig.database}`;
      
      if (clean) {
        command += ' -c'; // 清理现有对象
      }
      
      if (createDb) {
        command += ' -C'; // 创建数据库
      }
      
      if (dataOnly) {
        command += ' -a'; // 仅数据
      } else if (schemaOnly) {
        command += ' -s'; // 仅结构
      }
      
      if (verbose) {
        command += ' -v'; // 详细输出
      }
      
      if (noOwner) {
        command += ' -O'; // 不恢复所有权
      }
      
      if (noPrivileges) {
        command += ' -x'; // 不恢复权限
      }
      
      command += ` "${backupPath}"`;
    }
    
    // 设置密码环境变量
    const env = { ...process.env, PGPASSWORD: dbConfig.password };
    
    console.log('⏳ 执行恢复命令...');
    const { stdout, stderr } = await execAsync(command, { env });
    
    if (verbose && stderr) {
      console.log('📝 恢复日志:');
      console.log(stderr);
    }
    
    console.log('✅ 数据库恢复完成!');
    
  } catch (error) {
    console.error('❌ 恢复备份失败:', error.message);
    throw error;
  }
}

/**
 * 数据库健康检查
 */
async function healthCheck() {
  try {
    console.log('🔍 执行数据库健康检查...');
    
    const checks = [];
    
    // 1. 连接测试
    try {
      await pool.query('SELECT 1');
      checks.push({ name: '数据库连接', status: '✅ 正常', details: '连接成功' });
    } catch (error) {
      checks.push({ name: '数据库连接', status: '❌ 失败', details: error.message });
    }
    
    // 2. 表结构检查
    try {
      const tablesResult = await pool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);
      
      const expectedTables = ['users', 'sessions', 'messages'];
      const actualTables = tablesResult.rows.map(row => row.tablename);
      const missingTables = expectedTables.filter(table => !actualTables.includes(table));
      
      if (missingTables.length === 0) {
        checks.push({ 
          name: '表结构', 
          status: '✅ 正常', 
          details: `找到所有必需表: ${actualTables.join(', ')}` 
        });
      } else {
        checks.push({ 
          name: '表结构', 
          status: '⚠️ 警告', 
          details: `缺少表: ${missingTables.join(', ')}` 
        });
      }
    } catch (error) {
      checks.push({ name: '表结构', status: '❌ 失败', details: error.message });
    }
    
    // 3. 数据完整性检查
    try {
      // 检查外键约束
      const fkResult = await pool.query(`
        SELECT 
          tc.table_name,
          tc.constraint_name,
          tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      `);
      
      checks.push({ 
        name: '外键约束', 
        status: '✅ 正常', 
        details: `找到 ${fkResult.rows.length} 个外键约束` 
      });
    } catch (error) {
      checks.push({ name: '外键约束', status: '❌ 失败', details: error.message });
    }
    
    // 4. 索引检查
    try {
      const indexResult = await pool.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `);
      
      checks.push({ 
        name: '索引', 
        status: '✅ 正常', 
        details: `找到 ${indexResult.rows.length} 个索引` 
      });
    } catch (error) {
      checks.push({ name: '索引', status: '❌ 失败', details: error.message });
    }
    
    // 5. 数据统计
    try {
      const statsResult = await pool.query(`
        SELECT 
          'users' as table_name,
          COUNT(*) as row_count
        FROM users
        UNION ALL
        SELECT 
          'sessions' as table_name,
          COUNT(*) as row_count
        FROM sessions
        UNION ALL
        SELECT 
          'messages' as table_name,
          COUNT(*) as row_count
        FROM messages
      `);
      
      const stats = statsResult.rows.map(row => `${row.table_name}: ${row.row_count}`).join(', ');
      checks.push({ 
        name: '数据统计', 
        status: '✅ 正常', 
        details: stats 
      });
    } catch (error) {
      checks.push({ name: '数据统计', status: '❌ 失败', details: error.message });
    }
    
    // 6. 数据库大小
    try {
      const sizeResult = await pool.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      
      checks.push({ 
        name: '数据库大小', 
        status: '✅ 正常', 
        details: sizeResult.rows[0].size 
      });
    } catch (error) {
      checks.push({ name: '数据库大小', status: '❌ 失败', details: error.message });
    }
    
    // 输出检查结果
    console.log('\n📋 健康检查报告:');
    console.log('=' .repeat(60));
    
    checks.forEach(check => {
      console.log(`${check.status} ${check.name}: ${check.details}`);
    });
    
    const failedChecks = checks.filter(check => check.status.includes('❌'));
    const warningChecks = checks.filter(check => check.status.includes('⚠️'));
    
    console.log('\n📊 总结:');
    console.log(`✅ 通过: ${checks.length - failedChecks.length - warningChecks.length}`);
    console.log(`⚠️ 警告: ${warningChecks.length}`);
    console.log(`❌ 失败: ${failedChecks.length}`);
    
    return {
      checks,
      passed: checks.length - failedChecks.length - warningChecks.length,
      warnings: warningChecks.length,
      failed: failedChecks.length
    };
    
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    throw error;
  }
}

/**
 * 数据库优化
 */
async function optimizeDatabase() {
  try {
    console.log('🔧 开始数据库优化...');
    
    const operations = [];
    
    // 1. 更新表统计信息
    console.log('📊 更新表统计信息...');
    await pool.query('ANALYZE');
    operations.push('✅ 表统计信息已更新');
    
    // 2. 清理死元组
    console.log('🧹 清理死元组...');
    const tables = ['users', 'sessions', 'messages'];
    
    for (const table of tables) {
      try {
        await pool.query(`VACUUM ANALYZE ${table}`);
        operations.push(`✅ 已清理表: ${table}`);
      } catch (error) {
        operations.push(`❌ 清理表失败 ${table}: ${error.message}`);
      }
    }
    
    // 3. 重建索引（如果需要）
    console.log('🔄 检查索引状态...');
    const indexResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname
    `);
    
    operations.push(`✅ 检查了 ${indexResult.rows.length} 个索引`);
    
    // 4. 检查表膨胀
    console.log('📏 检查表膨胀...');
    try {
      const bloatResult = await pool.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);
      
      operations.push(`✅ 检查了 ${bloatResult.rows.length} 个表的大小`);
    } catch (error) {
      operations.push(`❌ 检查表膨胀失败: ${error.message}`);
    }
    
    console.log('\n🎯 优化操作完成:');
    operations.forEach(op => console.log(`  ${op}`));
    
    return operations;
    
  } catch (error) {
    console.error('❌ 数据库优化失败:', error.message);
    throw error;
  }
}

/**
 * 清理旧数据
 * @param {Object} options - 清理选项
 */
async function cleanupOldData(options = {}) {
  try {
    const {
      daysOld = 90,
      dryRun = true,
      cleanSessions = true,
      cleanMessages = true
    } = options;
    
    console.log(`🧹 清理 ${daysOld} 天前的旧数据...`);
    if (dryRun) {
      console.log('⚠️  试运行模式，不会实际删除数据');
    }
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    console.log(`📅 清理截止日期: ${cutoffDate.toISOString()}`);
    
    const results = [];
    
    if (cleanMessages) {
      // 查找旧消息
      const oldMessagesResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM messages m
        JOIN sessions s ON m.session_id = s.id
        WHERE s.updated_at < $1
      `, [cutoffDate]);
      
      const oldMessagesCount = parseInt(oldMessagesResult.rows[0].count);
      
      if (oldMessagesCount > 0) {
        if (!dryRun) {
          await pool.query(`
            DELETE FROM messages 
            WHERE session_id IN (
              SELECT id FROM sessions WHERE updated_at < $1
            )
          `, [cutoffDate]);
        }
        
        results.push({
          type: '消息',
          count: oldMessagesCount,
          action: dryRun ? '将删除' : '已删除'
        });
      }
    }
    
    if (cleanSessions) {
      // 查找旧会话
      const oldSessionsResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM sessions
        WHERE updated_at < $1
      `, [cutoffDate]);
      
      const oldSessionsCount = parseInt(oldSessionsResult.rows[0].count);
      
      if (oldSessionsCount > 0) {
        if (!dryRun) {
          await pool.query(`
            DELETE FROM sessions 
            WHERE updated_at < $1
          `, [cutoffDate]);
        }
        
        results.push({
          type: '会话',
          count: oldSessionsCount,
          action: dryRun ? '将删除' : '已删除'
        });
      }
    }
    
    console.log('\n📊 清理结果:');
    if (results.length > 0) {
      results.forEach(result => {
        console.log(`  ${result.action} ${result.count} 个${result.type}`);
      });
    } else {
      console.log('  没有找到需要清理的旧数据');
    }
    
    if (dryRun && results.length > 0) {
      console.log('\n如需实际删除，请使用: --cleanup-old --no-dry-run');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ 清理旧数据失败:', error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
      case 'backup':
        const backupPath = args[1];
        const format = args[2] || 'custom';
        const compress = !args.includes('--no-compress');
        const dataOnly = args.includes('--data-only');
        const schemaOnly = args.includes('--schema-only');
        
        await createBackup(backupPath, { format, compress, dataOnly, schemaOnly });
        break;
        
      case 'restore':
        const restorePath = args[1];
        if (!restorePath) {
          console.log('请提供备份文件路径: node database-maintenance.js restore <backup_file>');
          return;
        }
        
        const clean = args.includes('--clean');
        const createDb = args.includes('--create-db');
        const restoreDataOnly = args.includes('--data-only');
        const restoreSchemaOnly = args.includes('--schema-only');
        
        await restoreBackup(restorePath, { 
          clean, 
          createDb, 
          dataOnly: restoreDataOnly, 
          schemaOnly: restoreSchemaOnly 
        });
        break;
        
      case 'health':
        await healthCheck();
        break;
        
      case 'optimize':
        await optimizeDatabase();
        break;
        
      case 'cleanup-old':
        const daysOld = parseInt(args[1]) || 90;
        const dryRun = !args.includes('--no-dry-run');
        const cleanSessions = !args.includes('--no-sessions');
        const cleanMessages = !args.includes('--no-messages');
        
        await cleanupOldData({ daysOld, dryRun, cleanSessions, cleanMessages });
        break;
        
      default:
        console.log('数据库维护工具使用说明:');
        console.log('');
        console.log('命令列表:');
        console.log('  backup [path] [format]              - 创建数据库备份');
        console.log('  restore <backup_file>               - 恢复数据库备份');
        console.log('  health                              - 数据库健康检查');
        console.log('  optimize                            - 数据库优化');
        console.log('  cleanup-old [days] [options]        - 清理旧数据');
        console.log('');
        console.log('备份选项:');
        console.log('  --no-compress                       - 不压缩备份');
        console.log('  --data-only                         - 仅备份数据');
        console.log('  --schema-only                       - 仅备份结构');
        console.log('');
        console.log('恢复选项:');
        console.log('  --clean                             - 清理现有对象');
        console.log('  --create-db                         - 创建数据库');
        console.log('  --data-only                         - 仅恢复数据');
        console.log('  --schema-only                       - 仅恢复结构');
        console.log('');
        console.log('清理选项:');
        console.log('  --no-dry-run                        - 实际执行删除');
        console.log('  --no-sessions                       - 不清理会话');
        console.log('  --no-messages                       - 不清理消息');
        console.log('');
        console.log('示例:');
        console.log('  node database-maintenance.js backup');
        console.log('  node database-maintenance.js backup ./backup.sql plain');
        console.log('  node database-maintenance.js restore ./backup.backup');
        console.log('  node database-maintenance.js health');
        console.log('  node database-maintenance.js optimize');
        console.log('  node database-maintenance.js cleanup-old 30 --no-dry-run');
        break;
    }
    
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await pool.end();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  restoreBackup,
  healthCheck,
  optimizeDatabase,
  cleanupOldData
};