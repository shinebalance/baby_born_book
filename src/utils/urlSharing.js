// 共有可能なURLを生成する関数
export const generateShareableURL = (babyData) => {
  try {
    // ファイルデータは共有URLには含めない（サイズが大きすぎるため）
    const shareableData = {
      name: babyData.name || '',
      furigana: babyData.furigana || '',
      birthDate: babyData.birthDate || '',
      birthTime: babyData.birthTime || '',
      height: babyData.height || '',
      weight: babyData.weight || '',
      meaning: babyData.meaning || '',
      positions: babyData.positions || {}
    }
    
    // JSONを文字列化してBase64エンコード
    const jsonString = JSON.stringify(shareableData)
    const base64Data = btoa(encodeURIComponent(jsonString))
    
    // 現在のURLにクエリパラメータとして追加
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('data', base64Data)
    
    return currentUrl.toString()
  } catch (error) {
    console.error('URL生成エラー:', error)
    throw new Error('共有URL生成に失敗しました')
  }
}

// URLから設定データを読み込む関数
export const loadFromURL = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const encodedData = urlParams.get('data')
    
    if (!encodedData) {
      return null
    }
    
    // Base64デコードしてJSONパース
    const jsonString = decodeURIComponent(atob(encodedData))
    const data = JSON.parse(jsonString)
    
    // デフォルト値とマージ
    return {
      name: data.name || '',
      furigana: data.furigana || '',
      birthDate: data.birthDate || '',
      birthTime: data.birthTime || '',
      height: data.height || '',
      weight: data.weight || '',
      backgroundImage: null, // ファイルは共有しない
      babyPhoto: null, // ファイルは共有しない
      meaning: data.meaning || '',
      positions: data.positions || {
        nameSection: { x: 50, y: 20 },
        dateSection: { x: 50, y: 40 },
        photoSection: { x: 80, y: 60 },
        meaningSection: { x: 50, y: 80 }
      }
    }
  } catch (error) {
    console.error('URL読み込みエラー:', error)
    return null
  }
}

// URLクエリパラメータをクリアする関数
export const clearURLParameters = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('data')
  window.history.replaceState({}, '', url.toString())
}

// 短縮URLを生成する関数（将来的な拡張用）
export const generateShortURL = async (longUrl) => {
  // 実際のプロダクションでは、短縮URLサービスのAPIを使用
  // ここでは単純に長いURLをそのまま返す
  return longUrl
}

// データの妥当性を検証する関数
export const validateShareableData = (data) => {
  const errors = []
  
  // 必須項目のチェック
  if (!data.name || data.name.trim() === '') {
    errors.push('名前は必須です')
  }
  
  if (!data.furigana || data.furigana.trim() === '') {
    errors.push('ふりがなは必須です')
  }
  
  if (!data.birthDate) {
    errors.push('生年月日は必須です')
  }
  
  // 文字数制限のチェック
  if (data.name && data.name.length > 10) {
    errors.push('名前は10文字以内で入力してください')
  }
  
  if (data.furigana && data.furigana.length > 20) {
    errors.push('ふりがなは20文字以内で入力してください')
  }
  
  if (data.meaning && data.meaning.length > 200) {
    errors.push('名前の由来は200文字以内で入力してください')
  }
  
  // 数値項目のチェック
  if (data.height && (isNaN(data.height) || data.height < 0 || data.height > 100)) {
    errors.push('身長は0〜100cmの範囲で入力してください')
  }
  
  if (data.weight && (isNaN(data.weight) || data.weight < 0 || data.weight > 10000)) {
    errors.push('体重は0〜10000gの範囲で入力してください')
  }
  
  // 日付の妥当性チェック
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate)
    const now = new Date()
    
    if (isNaN(birthDate.getTime())) {
      errors.push('正しい日付を入力してください')
    } else if (birthDate > now) {
      errors.push('生年月日は現在の日付より前である必要があります')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ローカルストレージへの保存・読み込み機能
export const saveToLocalStorage = (babyData) => {
  try {
    const saveData = {
      ...babyData,
      // ファイルオブジェクトは保存しない
      backgroundImage: null,
      babyPhoto: null,
      savedAt: new Date().toISOString()
    }
    
    localStorage.setItem('babyNamingCertificate', JSON.stringify(saveData))
    return true
  } catch (error) {
    console.error('ローカルストレージ保存エラー:', error)
    return false
  }
}

export const loadFromLocalStorage = () => {
  try {
    const savedData = localStorage.getItem('babyNamingCertificate')
    if (!savedData) return null
    
    const data = JSON.parse(savedData)
    
    // 保存から30日以上経過している場合は削除
    if (data.savedAt) {
      const savedDate = new Date(data.savedAt)
      const now = new Date()
      const daysDiff = (now - savedDate) / (1000 * 60 * 60 * 24)
      
      if (daysDiff > 30) {
        localStorage.removeItem('babyNamingCertificate')
        return null
      }
    }
    
    return data
  } catch (error) {
    console.error('ローカルストレージ読み込みエラー:', error)
    return null
  }
}

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem('babyNamingCertificate')
    return true
  } catch (error) {
    console.error('ローカルストレージクリアエラー:', error)
    return false
  }
}