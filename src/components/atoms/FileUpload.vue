<template>
  <div class="mb-4">
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        type="file"
        :accept="accept"
        @change="handleFileChange"
        class="hidden"
        ref="fileInput"
      />
      <button
        type="button"
        @click="$refs.fileInput.click()"
        class="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <div class="flex flex-col items-center">
          <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <span class="text-sm text-gray-600">
            {{ fileName || 'ファイルを選択またはドラッグ＆ドロップ' }}
          </span>
        </div>
      </button>
    </div>
    <div v-if="preview && previewUrl" class="mt-2">
      <img :src="previewUrl" :alt="fileName" class="max-w-32 max-h-32 object-cover rounded-md" />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'FileUpload',
  props: {
    id: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    accept: {
      type: String,
      default: 'image/*'
    },
    preview: {
      type: Boolean,
      default: true
    },
    modelValue: {
      type: [File, String],
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const fileName = ref('')
    const previewUrl = ref('')

    const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        fileName.value = file.name
        if (props.preview && file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            previewUrl.value = e.target.result
          }
          reader.readAsDataURL(file)
        }
        emit('update:modelValue', file)
      }
    }

    watch(() => props.modelValue, (newValue) => {
      if (!newValue) {
        fileName.value = ''
        previewUrl.value = ''
      }
    })

    return {
      fileName,
      previewUrl,
      handleFileChange
    }
  }
}
</script>