import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

// 日本語文字を安全な文字に変換する関数
const replaceJapaneseChars = (text) => {
  if (!text) return text
  return text
    .replace(/命/g, 'Mei')
    .replace(/名/g, 'Na')
    .replace(/書/g, 'Sho')
    .replace(/生/g, 'Sei')
    .replace(/年/g, 'Nen')
    .replace(/月/g, 'Gatsu')
    .replace(/日/g, 'Nichi')
    .replace(/時/g, 'Ji')
    .replace(/分/g, 'Fun')
    .replace(/身長/g, 'Height')
    .replace(/体重/g, 'Weight')
    .replace(/令和/g, 'Reiwa')
    .replace(/平成/g, 'Heisei')
    .replace(/まれ/g, 'mare')
    .replace(/cm/g, 'cm')
    .replace(/g/g, 'g')
}

export const generatePDFDocument = async (babyData) => {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4サイズ (ポイント単位)
    
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    
    const { width, height } = page.getSize()
    
    // 背景色設定
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.98, 0.95, 0.95), // 薄いピンク系
    })
    
    // タイトル「命名書」
    page.drawText(replaceJapaneseChars('命名書'), {
      x: width / 2 - 60,
      y: height - 80,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
    
    // 名前セクション
    const namePosition = calculatePDFPosition(babyData.positions?.nameSection || { x: 50, y: 20 }, width, height)
    const nameStyle = babyData.nameStyle || { fontSize: 40, furiganaSize: 16, writingMode: 'horizontal' }
    
    if (babyData.name) {
      const isVertical = nameStyle.writingMode === 'vertical'
      
      if (isVertical) {
        // 縦書きの場合
        const chars = replaceJapaneseChars(babyData.name).split('')
        chars.forEach((char, index) => {
          page.drawText(char, {
            x: namePosition.x,
            y: namePosition.y - (index * nameStyle.fontSize),
            size: nameStyle.fontSize,
            font: boldFont,
            color: rgb(0.1, 0.1, 0.1),
          })
        })
        
        // ふりがな（縦書き）
        if (babyData.furigana) {
          const furiganaChars = replaceJapaneseChars(babyData.furigana).split('')
          furiganaChars.forEach((char, index) => {
            page.drawText(char, {
              x: namePosition.x - 30,
              y: namePosition.y - (index * nameStyle.furiganaSize),
              size: nameStyle.furiganaSize,
              font: font,
              color: rgb(0.3, 0.3, 0.3),
            })
          })
        }
      } else {
        // 横書きの場合（従来通り）
        page.drawText(replaceJapaneseChars(babyData.name), {
          x: namePosition.x - (babyData.name.length * (nameStyle.fontSize / 2)),
          y: namePosition.y,
          size: nameStyle.fontSize,
          font: boldFont,
          color: rgb(0.1, 0.1, 0.1),
        })
        
        // ふりがな
        if (babyData.furigana) {
          page.drawText(replaceJapaneseChars(babyData.furigana), {
            x: namePosition.x - (babyData.furigana.length * (nameStyle.furiganaSize / 2)),
            y: namePosition.y - 30,
            size: nameStyle.furiganaSize,
            font: font,
            color: rgb(0.3, 0.3, 0.3),
          })
        }
      }
    }
    
    // 生年月日セクション
    const datePosition = calculatePDFPosition(babyData.positions?.dateSection || { x: 50, y: 40 }, width, height)
    
    if (babyData.birthDate) {
      const formattedDate = replaceJapaneseChars(formatBirthDateForPDF(babyData.birthDate))
      page.drawText(formattedDate, {
        x: datePosition.x - (formattedDate.length * 6),
        y: datePosition.y,
        size: 12,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      })
      
      // 誕生時刻
      if (babyData.birthTime) {
        page.drawText(replaceJapaneseChars(`${babyData.birthTime} 生まれ`), {
          x: datePosition.x - 50,
          y: datePosition.y - 20,
          size: 10,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        })
      }
      
      // 身長・体重
      if (babyData.height || babyData.weight) {
        let physicalInfo = ''
        if (babyData.height) physicalInfo += `身長: ${babyData.height}cm`
        if (babyData.height && babyData.weight) physicalInfo += ' / '
        if (babyData.weight) physicalInfo += `体重: ${babyData.weight}g`
        
        page.drawText(replaceJapaneseChars(physicalInfo), {
          x: datePosition.x - (physicalInfo.length * 4),
          y: datePosition.y - 40,
          size: 10,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        })
      }
    }
    
    // フリーテキストセクション
    if (babyData.meaning) {
      const meaningPosition = calculatePDFPosition(babyData.positions?.meaningSection || { x: 50, y: 80 }, width, height)
      
      // フリーテキストを複数行に分割
      const lines = wrapText(replaceJapaneseChars(babyData.meaning), 40)
      lines.forEach((line, index) => {
        page.drawText(line, {
          x: meaningPosition.x - 100,
          y: meaningPosition.y - (index * 15),
          size: 10,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        })
      })
    }
    
    // 背景画像があれば埋め込み（基本的な実装）
    if (babyData.backgroundImage && typeof babyData.backgroundImage !== 'string') {
      try {
        const imageBytes = await fileToArrayBuffer(babyData.backgroundImage)
        let image
        
        if (babyData.backgroundImage.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes)
        } else if (babyData.backgroundImage.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(imageBytes)
        }
        
        if (image) {
          const imageDims = image.scale(0.3)
          page.drawImage(image, {
            x: 50,
            y: height - 200,
            width: imageDims.width,
            height: imageDims.height,
            opacity: 0.2,
          })
        }
      } catch (error) {
        console.warn('Background image embedding failed:', error)
      }
    }
    
    // お子様の写真があれば埋め込み
    if (babyData.babyPhoto && typeof babyData.babyPhoto !== 'string') {
      try {
        const imageBytes = await fileToArrayBuffer(babyData.babyPhoto)
        let image
        
        if (babyData.babyPhoto.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes)
        } else if (babyData.babyPhoto.type === 'image/jpeg') {
          image = await pdfDoc.embedJpg(imageBytes)
        }
        
        if (image) {
          const photoPosition = calculatePDFPosition(babyData.positions?.photoSection || { x: 80, y: 60 }, width, height)
          page.drawImage(image, {
            x: photoPosition.x - 50,
            y: photoPosition.y - 50,
            width: 100,
            height: 100,
          })
        }
      } catch (error) {
        console.warn('Baby photo embedding failed:', error)
      }
    }
    
    const pdfBytes = await pdfDoc.save()
    return new Blob([pdfBytes], { type: 'application/pdf' })
    
  } catch (error) {
    console.error('PDF生成エラー:', error)
    throw new Error('PDF生成に失敗しました')
  }
}

// パーセンテージ位置をPDF座標に変換
const calculatePDFPosition = (percentagePos, width, height) => {
  return {
    x: (percentagePos.x / 100) * width,
    y: height - ((percentagePos.y / 100) * height) // PDFは下が原点なので反転
  }
}

// 生年月日をPDF用にフォーマット
const formatBirthDateForPDF = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const reiwaStart = new Date('2019-05-01')
  let warekiYear = ''
  
  if (date >= reiwaStart) {
    const reiwaYear = year - 2018
    warekiYear = `令和${reiwaYear}年`
  } else {
    warekiYear = `平成${year - 1988}年`
  }
  
  return `${year}年${month}月${day}日（${warekiYear}${month}月${day}日）`
}

// テキストを指定文字数で改行
const wrapText = (text, maxCharsPerLine) => {
  const lines = []
  let currentLine = ''
  
  for (let i = 0; i < text.length; i++) {
    currentLine += text[i]
    
    if (currentLine.length >= maxCharsPerLine || i === text.length - 1) {
      lines.push(currentLine)
      currentLine = ''
    }
  }
  
  return lines
}

// FileをArrayBufferに変換
const fileToArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}