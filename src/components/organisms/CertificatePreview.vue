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
      <ResizableDraggableElement
        :position="babyData.positions?.nameSection || { x: 50, y: 20 }"
        :size="babyData.sizes?.nameSection || { width: 250, height: 100 }"
        container-id="certificate-preview"
        :min-width="150"
        :min-height="60"
        :max-width="400"
        :max-height="200"
        @update:position="updatePosition('nameSection', $event)"
        @update:size="updateSize('nameSection', $event)"
      >
        <div 
          class="bg-white bg-opacity-80 rounded-lg p-4 shadow-md w-full h-full flex flex-col justify-center"
          :class="nameContainerClass"
        >
          <div 
            :style="nameStyle"
            class="font-bold text-gray-800"
            :class="nameTextClass"
          >
            {{ babyData.name || '名前' }}
          </div>
          <div 
            :style="furiganaStyle"
            class="text-gray-600"
            :class="furiganaTextClass"
          >
            {{ babyData.furigana || 'ふりがな' }}
          </div>
        </div>
      </ResizableDraggableElement>

      <!-- 生年月日セクション -->
      <ResizableDraggableElement
        :position="babyData.positions?.dateSection || { x: 50, y: 40 }"
        :size="babyData.sizes?.dateSection || { width: 280, height: 120 }"
        container-id="certificate-preview"
        :min-width="200"
        :min-height="80"
        :max-width="450"
        :max-height="250"
        @update:position="updatePosition('dateSection', $event)"
        @update:size="updateSize('dateSection', $event)"
      >
        <div class="text-center bg-white bg-opacity-80 rounded-lg p-4 shadow-md w-full h-full flex flex-col justify-center">
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
      </ResizableDraggableElement>

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

      <!-- フリーテキストセクション -->
      <DraggableElement
        v-if="babyData.meaning"
        :position="babyData.positions?.meaningSection || { x: 50, y: 80 }"
        container-id="certificate-preview"
        @update:position="updatePosition('meaningSection', $event)"
      >
        <div class="max-w-xs bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
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
    <div class="mt-4 text-xs text-gray-600 text-center space-y-1">
      <div>各要素をドラッグして位置を調整できます</div>
      <div>名前・生年月日セクション：ホバーで表示される●をドラッグしてサイズ変更</div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import DraggableElement from '../atoms/DraggableElement.vue'
import ResizableDraggableElement from '../atoms/ResizableDraggableElement.vue'

export default {
  name: 'CertificatePreview',
  components: {
    DraggableElement,
    ResizableDraggableElement
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

    // 名前スタイルの計算
    const isVertical = computed(() => props.babyData.nameStyle?.writingMode === 'vertical')
    
    const nameContainerClass = computed(() => {
      return isVertical.value ? 'flex flex-col items-center' : 'text-center'
    })
    
    const nameTextClass = computed(() => {
      return isVertical.value ? 'writing-mode-vertical mb-2' : 'mb-2'
    })
    
    const furiganaTextClass = computed(() => {
      return isVertical.value ? 'writing-mode-vertical' : ''
    })
    
    const nameStyle = computed(() => {
      const fontSize = props.babyData.nameStyle?.fontSize || 40
      return {
        fontSize: `${fontSize}px`,
        writingMode: isVertical.value ? 'vertical-rl' : 'horizontal-tb',
        textOrientation: isVertical.value ? 'upright' : 'mixed'
      }
    })
    
    const furiganaStyle = computed(() => {
      const furiganaSize = props.babyData.nameStyle?.furiganaSize || 16
      return {
        fontSize: `${furiganaSize}px`,
        writingMode: isVertical.value ? 'vertical-rl' : 'horizontal-tb',
        textOrientation: isVertical.value ? 'upright' : 'mixed'
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

    const updateSize = (section, size) => {
      const newSizes = {
        ...props.babyData.sizes,
        [section]: size
      }
      
      emit('update:babyData', {
        ...props.babyData,
        sizes: newSizes
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
      updatePosition,
      updateSize,
      nameContainerClass,
      nameTextClass,
      furiganaTextClass,
      nameStyle,
      furiganaStyle
    }
  }
}
</script>