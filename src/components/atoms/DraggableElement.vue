<template>
  <div
    ref="draggableElement"
    :style="{ 
      left: `${position.x}%`, 
      top: `${position.y}%`,
      transform: 'translate(-50%, -50%)'
    }"
    class="absolute cursor-move select-none"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <slot />
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'

export default {
  name: 'DraggableElement',
  props: {
    position: {
      type: Object,
      default: () => ({ x: 50, y: 50 })
    },
    containerId: {
      type: String,
      required: true
    }
  },
  emits: ['update:position'],
  setup(props, { emit }) {
    const draggableElement = ref(null)
    const isDragging = ref(false)
    const dragOffset = reactive({ x: 0, y: 0 })

    const startDrag = (event) => {
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

    onUnmounted(() => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('touchend', stopDrag)
    })

    return {
      draggableElement,
      startDrag
    }
  }
}
</script>