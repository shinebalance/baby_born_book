<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        id="name"
        label="名前（漢字）"
        v-model="formData.name"
        :required="true"
        :max-length="10"
        placeholder="例: 太郎"
      />
      
      <InputField
        id="furigana"
        label="ふりがな"
        v-model="formData.furigana"
        :required="true"
        :max-length="20"
        placeholder="例: たろう"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        id="birthDate"
        label="生年月日"
        type="date"
        v-model="formData.birthDate"
        :required="true"
      />
      
      <InputField
        id="birthTime"
        label="誕生時刻"
        type="time"
        v-model="formData.birthTime"
        placeholder="例: 14:30"
      />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        id="height"
        label="身長 (cm)"
        type="number"
        v-model="formData.height"
        placeholder="例: 50"
      />
      
      <InputField
        id="weight"
        label="体重 (g)"
        type="number"
        v-model="formData.weight"
        placeholder="例: 3200"
      />
    </div>

    <div class="space-y-4">
      <FileUpload
        id="backgroundImage"
        label="背景画像（オプション）"
        v-model="formData.backgroundImage"
        accept="image/*"
      />
      
      <FileUpload
        id="babyPhoto"
        label="お子様の写真（オプション）"
        v-model="formData.babyPhoto"
        accept="image/*"
      />
    </div>

    <div>
      <label for="meaning" class="block text-sm font-medium text-gray-700 mb-2">
        名前の由来・意味（オプション）
      </label>
      <textarea
        id="meaning"
        v-model="formData.meaning"
        rows="3"
        :maxlength="200"
        placeholder="名前に込めた思いや由来を記入してください..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p class="text-xs text-gray-500 mt-1">
        {{ formData.meaning?.length || 0 }} / 200
      </p>
    </div>

    <!-- バリデーションエラー表示 -->
    <div v-if="validationErrors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <h4 class="text-red-800 font-semibold mb-2">入力エラー</h4>
      <ul class="text-red-700 text-sm space-y-1">
        <li v-for="error in validationErrors" :key="error">• {{ error }}</li>
      </ul>
    </div>

    <div class="pt-4 flex gap-2">
      <button
        type="button"
        @click="resetForm"
        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        リセット
      </button>
      <button
        type="button"
        @click="saveToLocal"
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
      >
        一時保存
      </button>
    </div>
  </form>
</template>

<script>
import { reactive, watch, computed } from 'vue'
import InputField from '../atoms/InputField.vue'
import FileUpload from '../atoms/FileUpload.vue'
import { validateShareableData } from '../../utils/urlSharing.js'

export default {
  name: 'BabyInfoForm',
  components: {
    InputField,
    FileUpload
  },
  props: {
    babyData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:babyData'],
  setup(props, { emit }) {
    const formData = reactive({
      name: '',
      furigana: '',
      birthDate: '',
      birthTime: '',
      height: '',
      weight: '',
      backgroundImage: null,
      babyPhoto: null,
      meaning: '',
      ...props.babyData
    })

    // バリデーション結果
    const validationResult = computed(() => {
      return validateShareableData(formData)
    })

    const validationErrors = computed(() => {
      return validationResult.value.errors
    })

    watch(formData, (newData) => {
      emit('update:babyData', { ...newData })
    }, { deep: true })

    watch(() => props.babyData, (newData) => {
      Object.assign(formData, newData)
    }, { deep: true })

    const resetForm = () => {
      Object.assign(formData, {
        name: '',
        furigana: '',
        birthDate: '',
        birthTime: '',
        height: '',
        weight: '',
        backgroundImage: null,
        babyPhoto: null,
        meaning: ''
      })
    }

    const saveToLocal = () => {
      try {
        // バリデーションチェック
        if (!validationResult.value.isValid) {
          alert('入力内容にエラーがあります。修正してから保存してください。')
          return
        }

        const { saveToLocalStorage } = require('../../utils/urlSharing.js')
        const success = saveToLocalStorage(formData)
        
        if (success) {
          alert('データを一時保存しました')
        } else {
          alert('保存に失敗しました')
        }
      } catch (error) {
        console.error('保存エラー:', error)
        alert('保存に失敗しました')
      }
    }

    const handleSubmit = () => {
      // フォーム送信処理は親コンポーネントで処理
    }

    return {
      formData,
      validationErrors,
      resetForm,
      saveToLocal,
      handleSubmit
    }
  }
}
</script>