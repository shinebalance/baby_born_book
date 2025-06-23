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