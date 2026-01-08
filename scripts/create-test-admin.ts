/**
 * 創建測試管理員帳號的輔助腳本
 * 
 * 使用方法：
 * 1. 確保已設置 Supabase 環境變數
 * 2. 在 Supabase Dashboard 中先創建 Auth 用戶
 * 3. 執行此腳本（需要 Node.js 環境）
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 請先設置環境變數：')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestAdmin() {
  const testEmail = 'admin@test.com'
  const testPassword = 'admin123456'
  const testName = '測試管理員'

  try {
    // 步驟 1: 創建 Auth 用戶
    console.log('📝 正在創建 Auth 用戶...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: testName
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  用戶已存在，嘗試獲取現有用戶...')
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const user = existingUser?.users.find(u => u.email === testEmail)
        
        if (!user) {
          throw new Error('無法找到現有用戶')
        }
        
        console.log('✅ 使用現有用戶 ID:', user.id)
        
        // 步驟 2: 在 admin_users 表中插入記錄
        const { error: adminError } = await supabase
          .from('admin_users')
          .upsert({
            id: user.id,
            email: testEmail,
            full_name: testName,
            role: 'admin',
            is_active: true
          })

        if (adminError) {
          throw adminError
        }

        console.log('✅ 測試管理員帳號設置完成！')
        console.log('\n📋 登入資訊：')
        console.log('   Email:', testEmail)
        console.log('   Password:', testPassword)
        console.log('   登入網址: http://localhost:3000/admin/login')
        return
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('創建用戶失敗')
    }

    console.log('✅ Auth 用戶創建成功，ID:', authData.user.id)

    // 步驟 2: 在 admin_users 表中插入記錄
    console.log('📝 正在設置管理員權限...')
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        full_name: testName,
        role: 'admin',
        is_active: true
      })

    if (adminError) {
      // 如果已存在，嘗試更新
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          email: testEmail,
          full_name: testName,
          role: 'admin',
          is_active: true
        })
        .eq('id', authData.user.id)

      if (updateError) {
        throw updateError
      }
      console.log('✅ 管理員權限已更新')
    } else {
      console.log('✅ 管理員權限設置成功')
    }

    console.log('\n🎉 測試管理員帳號創建完成！')
    console.log('\n📋 登入資訊：')
    console.log('   Email:', testEmail)
    console.log('   Password:', testPassword)
    console.log('   登入網址: http://localhost:3000/admin/login')
    console.log('\n💡 提示：如果用戶已存在，請使用 SQL 腳本手動設置')

  } catch (error: any) {
    console.error('❌ 錯誤:', error.message)
    console.log('\n💡 建議：使用手動方式設置（見 supabase-test-account.sql）')
    process.exit(1)
  }
}

createTestAdmin()
