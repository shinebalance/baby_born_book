import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

export const generatePDFDocument = async (babyData) => {
  try {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4サイズ (ポイント単位)
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
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
    page.drawText('命名書', {
      x: width / 2 - 60,
      y: height - 80,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    })
    
    // 名前セクション
    const namePosition = calculatePDFPosition(babyData.positions?.nameSection || { x: 50, y: 20 }, width, height)
    
    if (babyData.name) {
      // 名前（漢字）
      page.drawText(babyData.name, {
        x: namePosition.x - (babyData.name.length * 20),
        y: namePosition.y,
        size: 40,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      })
      
      // ふりがな
      if (babyData.furigana) {
        page.drawText(babyData.furigana, {
          x: namePosition.x - (babyData.furigana.length * 8),
          y: namePosition.y - 30,
          size: 16,
          font: font,
          color: rgb(0.3, 0.3, 0.3),
        })
      }
    }
    
    // 生年月日セクション
    const datePosition = calculatePDFPosition(babyData.positions?.dateSection || { x: 50, y: 40 }, width, height)
    
    if (babyData.birthDate) {
      const formattedDate = formatBirthDateForPDF(babyData.birthDate)
      page.drawText(formattedDate, {
        x: datePosition.x - (formattedDate.length * 6),
        y: datePosition.y,
        size: 12,
        font: font,
        color: rgb(0.2, 0.2, 0.2),
      })
      
      // 誕生時刻
      if (babyData.birthTime) {
        page.drawText(`${babyData.birthTime} 生まれ`, {
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
        
        page.drawText(physicalInfo, {
          x: datePosition.x - (physicalInfo.length * 4),
          y: datePosition.y - 40,
          size: 10,
          font: font,
          color: rgb(0.4, 0.4, 0.4),
        })
      }
    }
    
    // 由来セクション
    if (babyData.meaning) {
      const meaningPosition = calculatePDFPosition(babyData.positions?.meaningSection || { x: 50, y: 80 }, width, height)
      
      page.drawText('名前の由来:', {
        x: meaningPosition.x - 50,
        y: meaningPosition.y,
        size: 12,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.2),
      })
      
      // 意味のテキストを複数行に分割
      const lines = wrapText(babyData.meaning, 40)
      lines.forEach((line, index) => {
        page.drawText(line, {
          x: meaningPosition.x - 100,
          y: meaningPosition.y - 20 - (index * 15),
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