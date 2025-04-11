<template>
  <n-modal
      v-model:show="modalVisible"
      preset="card"
      :closable="false"
      :mask-closable="false"
      title="图片相似"
      :style="modalStyle"
      :segmented="false"
      :bordered="false"
  >
    <n-flex justify="center" align="center" size="large">
      <!-- 左侧图片 -->
      <n-flex vertical justify="center" align="center" size="medium">
        <n-image
            :height="200"
            object-fit="contain"
            :src="pictureData.src.src || ''"
        />
        <n-text>{{ pictureData.src.name || '源图像' }}</n-text>
      </n-flex>

      <!-- 中间图标 -->
      <n-flex vertical justify="center" align="center" size="medium">
        <n-icon style="margin: 1rem" size="30" :component="SwapHorizontal" />
        <n-text>&ensp;</n-text>
      </n-flex>

      <!-- 右侧图片 -->
      <n-flex vertical justify="center" align="center" size="medium">
        <n-image
            :height="200"
            object-fit="contain"
            :src="pictureData.sim.src || ''"
        />
        <n-text>{{ pictureData.sim.name || '相似图像' }}</n-text>
      </n-flex>
    </n-flex>

    <template #footer>
      <n-flex justify="end" size="large">
        <n-button type="error" @click="closeModal">
          确定
        </n-button>
      </n-flex>
    </template>
  </n-modal>
</template>

<script setup>
import { computed } from 'vue';
import { SwapHorizontal } from "@vicons/ionicons5";

// 定义props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  pictureData: {
    type: Object,
    default: () => ({
      src: {
        name: "源图像",
        src: "",
      },
      sim: {
        name: "相似图像",
        src: "",
      }
    })
  }
});

// 定义emit
const emit = defineEmits(['update:show']);

// 使用计算属性处理v-model双向绑定
const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

// 控制模态框样式
const modalStyle = computed(() => ({
  width: 'auto',
  minWidth: '300px',
  maxWidth: '90%'
}));

// 关闭模态框的方法
const closeModal = () => {
  modalVisible.value = false;
};

// 暴露方法给父组件
defineExpose({
  open: () => {
    modalVisible.value = true;
  },
  close: () => {
    modalVisible.value = false;
  }
});
</script>

<style scoped>
/* 可以添加一些过渡效果 */
:deep(.n-card) {
  transition: all 0.3s ease;
}
</style>