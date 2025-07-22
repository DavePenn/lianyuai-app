-- 为现有用户表添加Google OAuth支持字段的迁移脚本

-- 添加name字段
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(255);
    END IF;
END $$;

-- 添加google_id字段
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'google_id') THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
    END IF;
END $$;

-- 添加avatar字段
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'avatar') THEN
        ALTER TABLE users ADD COLUMN avatar TEXT;
    END IF;
END $$;

-- 修改password_hash字段为可选（因为Google用户不需要密码）
DO $$ 
BEGIN 
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
END $$;

-- 创建索引提高性能
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
