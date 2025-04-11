<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UploadFileInfo, UploadCustomRequestOptions } from "naive-ui";
import { Archive } from "@vicons/ionicons5";

// 定义props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

// 定义emit
const emit = defineEmits(['update:show', 'upload-files']);

// 使用计算属性处理v-model双向绑定
const modalVisible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
});

// 控制模态框样式
const modalStyle = computed(() => ({
  width: 'auto',
  minWidth: '500px',
  maxWidth: '90%'
}));

// 上传文件列表
const fileList = ref<UploadFileInfo[]>([]);

// 处理文件上传变化
const handleChange = (options: { fileList: UploadFileInfo[] }) => {
  fileList.value = options.fileList;
};

// 自定义上传请求（阻止自动上传到服务器）
const customRequest = ({ file, onFinish }: UploadCustomRequestOptions) => {
  // 这里只是在UI上显示文件，不实际上传
  onFinish();
  return;
};

// 确认上传
const confirmUpload = () => {
  // 收集所有文件
  const files = fileList.value.map(file => file.file);
  // 发送给父组件处理
  emit('upload-files', files);
  closeModal();
};

// 关闭模态框
const closeModal = () => {
  // 关闭时清空文件列表
  fileList.value = [];
  modalVisible.value = false;
};

// 暴露方法给父组件
defineExpose({
  open: () => {
    modalVisible.value = true;
  },
  close: () => {
    fileList.value = [];
    modalVisible.value = false;
  }
});
</script>

<template>
  <n-modal
      v-model:show="modalVisible"
      preset="card"
      :closable="false"
      :mask-closable="false"
      title="上传表情包"
      :style="modalStyle"
      :segmented="false"
      :bordered="false"
  >
    <div class="upload-container">
      <!-- 上方：已上传文件列表区域 -->
      <div class="file-list-area">
        <n-h3 v-if="fileList.length > 0">已添加文件</n-h3>

        <div class="image-preview-list">
          <n-upload
              ref="upload"
              list-type="image-card"
              :default-file-list="fileList"
              v-model:file-list="fileList"
              :max="5"
              :custom-request="customRequest"
              :multiple="true"
              directory-dnd
          >
            <n-upload-dragger>
              <div style="margin-bottom: 12px">
                <n-icon size="48" :depth="3" :component="Archive" />
              </div>
              <n-text style="font-size: 16px">
                点击或者拖动文件到该区域来上传
              </n-text>
              <n-p depth="3" style="margin: 8px 0 0 0">
                {{ fileList.length >= 5 ? '已达到最大上传数量 (5)' : '支持JPG、PNG、GIF等图片格式，最多上传5张图片' }}
              </n-p>
            </n-upload-dragger>
          </n-upload>
        </div>
      </div>


      <!-- 添加的信息提示 -->
      <div class="upload-info" v-if="fileList.length > 0">
        <n-alert type="info" :show-icon="false">
          已添加 {{ fileList.length }}/5 个文件
        </n-alert>
      </div>
    </div>

    <template #footer>
      <n-flex justify="end" size="large">
        <n-button @click="closeModal" style="margin-right: 12px">
          取消
        </n-button>
        <n-button
            type="primary"
            :disabled="fileList.length === 0"
            @click="confirmUpload"
        >
          确认上传
        </n-button>
      </n-flex>
    </template>
  </n-modal>
</template>

<style scoped>
.upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-list-area {
  min-height: 80px;
}

.image-preview-list :deep(.n-upload-trigger) {
  display: none;
}

.upload-drag-area {
  margin-top: 8px;
}

.upload-info {
  margin-top: 8px;
}

/* 自定义卡片样式 */
:deep(.n-card) {
  transition: all 0.3s ease;
}

:deep(.n-upload-file-list) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.n-upload-file) {
  margin-right: 0 !important;
}
</style>