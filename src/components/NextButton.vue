<template>
  <button type="button" class="next-btn" @click="$emit('click')">
    <span class="next-text">{{ cleanLabel }}</span>
    <span v-if="showArrow" class="next-arrow" aria-hidden="true">→</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    arrow?: boolean
  }>(),
  { arrow: true },
)

defineEmits<{
  click: []
}>()

const hasTrailingArrow = computed(() => /\s*→\s*$/.test(props.label))
const showArrow = computed(() => props.arrow && (hasTrailingArrow.value || !/[↺←↑↓]/.test(props.label)))
const cleanLabel = computed(() => props.label.replace(/\s*→\s*$/, ''))
</script>

<style scoped>
.next-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border: 1.5px solid rgba(92, 75, 62, 0.25);
  border-radius: 6px;
  background: rgba(255, 253, 249, 0.96);
  box-shadow: 0 4px 12px rgba(36, 29, 24, 0.16);
  color: var(--ink);
  font-family: var(--font-hand);
  font-size: 23px;
  line-height: 1.15;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.next-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 6px rgba(36, 29, 24, 0.18);
}

.next-arrow {
  color: var(--accent-red);
  font-family: var(--font-body);
  font-weight: 700;
}
</style>
