<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-baby-pink to-baby-blue">
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
        命名書生成アプリ
      </h1>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 入力フォーム -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-700">基本情報</h2>
          <BabyInfoForm 
            v-model:baby-data="babyData"
            @update:baby-data="updateBabyData"
          />
        </div>

        <!-- プレビュー -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-700">プレビュー</h2>
          
          <!-- 名前スタイル設定 -->
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-semibold mb-3 text-gray-600">名前スタイル設定</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <!-- フォントサイズ -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">名前サイズ</label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  v-model="babyData.nameStyle.fontSize"
                  class="w-full"
                />
                <span class="text-xs text-gray-500">{{ babyData.nameStyle.fontSize }}px</span>
              </div>
              
              <!-- ふりがなサイズ -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">ふりがなサイズ</label>
                <input
                  type="range"
                  min="8"
                  max="24"
                  v-model="babyData.nameStyle.furiganaSize"
                  class="w-full"
                />
                <span class="text-xs text-gray-500">{{ babyData.nameStyle.furiganaSize }}px</span>
              </div>
              
              <!-- 文字方向 -->
              <div>
                <label class="block text-xs text-gray-600 mb-1">文字方向</label>
                <select
                  v-model="babyData.nameStyle.writingMode"
                  class="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="horizontal">横書き</option>
                  <option value="vertical">縦書き</option>
                </select>
              </div>
            </div>
          </div>
          
          <CertificatePreview 
            :baby-data="babyData"
            @update:baby-data="updateBabyData"
          />
          
          <div class="mt-4 flex gap-2">
            <button
              @click="generatePDF"
              class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              PDF生成
            </button>
            <button
              @click="generateShareURL"
              class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              共有URL生成
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, onMounted } from 'vue'
import BabyInfoForm from './components/organisms/BabyInfoForm.vue'
import CertificatePreview from './components/organisms/CertificatePreview.vue'
import { generatePDFDocument } from './utils/pdfGenerator'
import { generateShareableURL, loadFromURL } from './utils/urlSharing'

export default {
  name: 'App',
  components: {
    BabyInfoForm,
    CertificatePreview
  },
  setup() {
    const babyData = reactive({
      name: '',
      furigana: '',
      birthDate: '',
      birthTime: '',
      height: '',
      weight: '',
      backgroundImage: null,
      babyPhoto: null,
      meaning: '',
      positions: {
        nameSection: { x: 50, y: 20 },
        dateSection: { x: 50, y: 40 },
        photoSection: { x: 50, y: 60 },
        meaningSection: { x: 50, y: 80 }
      },
      sizes: {
        nameSection: { width: 250, height: 100 },
        dateSection: { width: 280, height: 120 }
      },
      nameStyle: {
        fontSize: 40,
        furiganaSize: 16,
        writingMode: 'horizontal' // 'horizontal' | 'vertical'
      }
    })

    const updateBabyData = (newData) => {
      Object.assign(babyData, newData)
    }

    const generatePDF = async () => {
      try {
        const pdfBlob = await generatePDFDocument(babyData)
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `命名書_${babyData.name || '新生児'}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('PDF生成エラー:', error)
        alert('PDF生成に失敗しました')
      }
    }

    const generateShareURL = () => {
      const shareURL = generateShareableURL(babyData)
      navigator.clipboard.writeText(shareURL).then(() => {
        alert('共有URLをクリップボードにコピーしました')
      }).catch(() => {
        prompt('共有URL:', shareURL)
      })
    }


    onMounted(() => {
      const urlData = loadFromURL()
      if (urlData) {
        Object.assign(babyData, urlData)
      }
    })

    return {
      babyData,
      updateBabyData,
      generatePDF,
      generateShareURL
    }
  }
}
</script>