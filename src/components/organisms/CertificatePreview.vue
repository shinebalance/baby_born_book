<template>
  <div class="relative">
    <div 
      id="certificate-preview"
      class="relative w-full aspect-[210/297] bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg"
      :style="backgroundStyle"
    >
      <!-- 背景画像 -->
      <div v-if="backgroundImageUrl" class="absolute inset-0 opacity-30">
        <img :src="backgroundImageUrl" alt="背景" class="w-full h-full object-cover" />
      </div>

      <!-- 名前セクション -->
      <DraggableElement
        :position="babyData.positions?.nameSection || { x: 50, y: 20 }"
        container-id="certificate-preview"
        @update:position="updatePosition('nameSection', $event)"
      >
        <div class="text-center bg-white bg-opacity-80 rounded-lg p-4 shadow-md">
          <div class="text-4xl font-bold text-gray-800 mb-2">
            {{ babyData.name || '名前' }}
          </div>
          <div class="text-lg text-gray-600">
            {{ babyData.furigana || 'ふりがな' }}
          </div>
        </div>
      </DraggableElement>

      <!-- 生年月日セクション -->
      <DraggableElement
        :position="babyData.positions?.dateSection || { x: 50, y: 40 }"
        container-id="certificate-preview"
        @update:position="updatePosition('dateSection', $event)"
      >
        <div class="text-center bg-white bg-opacity-80 rounded-lg p-4 shadow-md">
          <div class="text-lg font-semibold text-gray-700 mb-2">
            {{ formatBirthDate(babyData.birthDate) }}
          </div>
          <div v-if="babyData.birthTime" class="text-sm text-gray-600 mb-1">
            {{ babyData.birthTime }} 生まれ
          </div>
          <div v-if="babyData.height || babyData.weight" class="text-sm text-gray-600">
            <span v-if="babyData.height">身長: {{ babyData.height }}cm</span>
            <span v-if="babyData.height && babyData.weight"> / </span>
            <span v-if="babyData.weight">体重: {{ babyData.weight }}g</span>
          </div>
        </div>
      </DraggableElement>

      <!-- 写真セクション -->
      <DraggableElement
        v-if="babyPhotoUrl"
        :position="babyData.positions?.photoSection || { x: 80, y: 60 }"
        container-id="certificate-preview"
        @update:position="updatePosition('photoSection', $event)"
      >
        <div class="bg-white rounded-full p-2 shadow-lg">
          <img 
            :src="babyPhotoUrl" 
            alt="お子様の写真" 
            class="w-24 h-24 rounded-full object-cover"
          />
        </div>
      </DraggableElement>

      <!-- 由来セクション -->
      <DraggableElement
        v-if="babyData.meaning"
        :position="babyData.positions?.meaningSection || { x: 50, y: 80 }"
        container-id="certificate-preview"
        @update:position="updatePosition('meaningSection', $event)"
      >
        <div class="max-w-xs bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
          <div class="text-sm font-semibold text-gray-700 mb-2">名前の由来</div>
          <div class="text-xs text-gray-600 leading-relaxed">
            {{ babyData.meaning }}
          </div>
        </div>
      </DraggableElement>

      <!-- 装飾的な要素 -->
      <div class="absolute top-4 left-4 right-4 text-center">
        <div class="text-2xl font-bold text-gray-700 opacity-60">命名書</div>
      </div>
    </div>

    <!-- 操作説明 -->
    <div class="mt-4 text-sm text-gray-600 text-center">
      各要素をドラッグして位置を調整できます
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import DraggableElement from '../atoms/DraggableElement.vue'

export default {
  name: 'CertificatePreview',
  components: {
    DraggableElement
  },
  props: {
    babyData: {
      type: Object,
      required: true
    }
  },
  emits: ['update:babyData'],
  setup(props, { emit }) {
    const backgroundImageUrl = ref('')
    const babyPhotoUrl = ref('')

    const backgroundStyle = computed(() => {
      return {
        background: 'linear-gradient(135deg, #ffeef0 0%, #f0f9ff 100%)'
      }
    })

    const formatBirthDate = (dateString) => {
      if (!dateString) return '生年月日'
      
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      
      // 和暦変換（令和）
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

    const updatePosition = (section, position) => {
      const newPositions = {
        ...props.babyData.positions,
        [section]: position
      }
      
      emit('update:babyData', {
        ...props.babyData,
        positions: newPositions
      })
    }

    // 画像ファイルをBase64 URLに変換
    const convertFileToUrl = (file) => {
      return new Promise((resolve) => {
        if (!file) {
          resolve('')
          return
        }
        
        if (typeof file === 'string') {
          resolve(file)
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    }

    // 背景画像とお子様の写真を監視
    watch(() => props.babyData.backgroundImage, async (newFile) => {
      backgroundImageUrl.value = await convertFileToUrl(newFile)
    }, { immediate: true })

    watch(() => props.babyData.babyPhoto, async (newFile) => {
      babyPhotoUrl.value = await convertFileToUrl(newFile)
    }, { immediate: true })

    return {
      backgroundImageUrl,
      babyPhotoUrl,
      backgroundStyle,
      formatBirthDate,
      updatePosition
    }
  }
}
</script>