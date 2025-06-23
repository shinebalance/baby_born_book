<template>
  <div
    ref="resizableElement"
    :style="{ 
      left: `${position.x}%`, 
      top: `${position.y}%`,
      width: `${size.width}px`,
      height: `${size.height}px`,
      transform: 'translate(-50%, -50%)'
    }"
    class="absolute cursor-move select-none group"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <slot />
    
    <!-- リサイズハンドル -->
    <div
      v-show="showResizeHandles"
      class="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
      @mousedown.stop="startResize"
      @touchstart.stop="startResize"
    >
    </div>
    
    <!-- サイズ表示 -->
    <div
      v-show="showSizeIndicator && (isDragging || isResizing)"
      class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
    >
      {{ Math.round(size.width) }}×{{ Math.round(size.height) }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ResizableDraggableElement',
  props: {
    position: {
      type: Object,
      default: () => ({ x: 50, y: 50 })
    },
    size: {
      type: Object,
      default: () => ({ width: 200, height: 100 })
    },
    containerId: {
      type: String,
      required: true
    },
    showResizeHandles: {
      type: Boolean,
      default: true
    },
    showSizeIndicator: {
      type: Boolean,
      default: true
    },
    minWidth: {
      type: Number,
      default: 100
    },
    minHeight: {
      type: Number,
      default: 50
    },
    maxWidth: {
      type: Number,
      default: 500
    },
    maxHeight: {
      type: Number,
      default: 300
    }
  },
  emits: ['update:position', 'update:size'],
  setup(props, { emit }) {
    const resizableElement = ref(null)
    const isDragging = ref(false)
    const isResizing = ref(false)
    const dragOffset = reactive({ x: 0, y: 0 })
    const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0 })

    const startDrag = (event) => {
      if (isResizing.value) return
      
      isDragging.value = true
      
      const container = document.getElementById(props.containerId)
      if (!container) return

      const rect = container.getBoundingClientRect()
      const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX
      const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY
      
      dragOffset.x = clientX - rect.left - (props.position.x / 100 * rect.width)
      dragOffset.y = clientY - rect.top - (props.position.y / 100 * rect.height)

      document.addEventListener('mousemove', onDrag)
      document.addEventListener('touchmove', onDrag)
      document.addEventListener('mouseup', stopDrag)
      document.addEventListener('touchend', stopDrag)
      
      event.preventDefault()
    }

    const onDrag = (event) => {
      if (!isDragging.value) return

      const container = document.getElementById(props.containerId)
      if (!container) return

      const rect = container.getBoundingClientRect()
      const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX
      const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY
      
      const x = ((clientX - rect.left - dragOffset.x) / rect.width) * 100
      const y = ((clientY - rect.top - dragOffset.y) / rect.height) * 100

      const newPosition = {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      }

      emit('update:position', newPosition)
    }

    const stopDrag = () => {
      isDragging.value = false
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('touchend', stopDrag)
    }

    const startResize = (event) => {
      isResizing.value = true
      
      const clientX = event.type === 'touchstart' ? event.touches[0].clientX : event.clientX
      const clientY = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY
      
      resizeStart.x = clientX
      resizeStart.y = clientY
      resizeStart.width = props.size.width
      resizeStart.height = props.size.height

      document.addEventListener('mousemove', onResize)
      document.addEventListener('touchmove', onResize)
      document.addEventListener('mouseup', stopResize)
      document.addEventListener('touchend', stopResize)
      
      event.preventDefault()
    }

    const onResize = (event) => {
      if (!isResizing.value) return

      const clientX = event.type === 'touchmove' ? event.touches[0].clientX : event.clientX
      const clientY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY
      
      const deltaX = clientX - resizeStart.x
      const deltaY = clientY - resizeStart.y
      
      const newWidth = Math.max(props.minWidth, Math.min(props.maxWidth, resizeStart.width + deltaX))
      const newHeight = Math.max(props.minHeight, Math.min(props.maxHeight, resizeStart.height + deltaY))

      emit('update:size', { width: newWidth, height: newHeight })
    }

    const stopResize = () => {
      isResizing.value = false
      document.removeEventListener('mousemove', onResize)
      document.removeEventListener('touchmove', onResize)
      document.removeEventListener('mouseup', stopResize)
      document.removeEventListener('touchend', stopResize)
    }

    onUnmounted(() => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('touchend', stopDrag)
      document.removeEventListener('mousemove', onResize)
      document.removeEventListener('touchmove', onResize)
      document.removeEventListener('mouseup', stopResize)
      document.removeEventListener('touchend', stopResize)
    })

    return {
      resizableElement,
      isDragging,
      isResizing,
      startDrag
    }
  }
}
</script>