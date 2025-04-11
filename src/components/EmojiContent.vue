<script setup lang="ts">

import {CloudUpload, CodeSlash} from "@vicons/ionicons5";
import EmojiInfiniteScroll from "@/components/EmojiData.vue";
//import {useDialog} from 'naive-ui'
import {ref} from "vue";
import ModelSimilarPictures from "@/components/dialog/ModelSimilarPictures.vue";
import {mockDelay} from "@/utils/mockData.ts";
//import ModelUploadPictures from "@/components/dialog/ModelUploadPictures.vue";

//const dialog = useDialog()
// const handleUploadClick = () => {
//   showModelSimilarPictures.value = true;
// }
const showModelSimilarPictures = ref(false)
const uploading = ref(false)
const onUploadCheck = async () => {
  showModelSimilarPictures.value = true
}

</script>

<template>
  <n-modal-provider>
  <n-layout-content style="width: 80%">
    <n-flex vertical align="center">
      <br>

      <n-h1 type="info" style="text-align: center; margin-bottom: 0">
        <n-text type="primary">486表情包收集站</n-text>
      </n-h1>
      <n-h4 type="info" style="text-align: center;margin-top: auto">
        <n-text type="primary">Sub Title|Sub Title|Sub Title|Sub Title</n-text>
      </n-h4>
      <n-flex vertical>
        <n-button strong round type="primary" size="large" @click="onUploadCheck" :loading="uploading">
          <n-icon size="25" :component="CloudUpload"/>&ensp;上传表情包
        </n-button>
        <div/>
        <n-button strong ghost round type="primary" size="large" disabled>
          <n-icon size="25" :component="CodeSlash"/>&ensp;随机表情包API
        </n-button>
      </n-flex>

      <ModelSimilarPictures v-model:show="showModelSimilarPictures" :picture-data="{src:{src:'',name:'114514'},sim:{src:'',name:'114514'}}"/>
<!--      <ModelUploadPictures v-model:show="showModelSimilarPictures" />-->
    </n-flex>
    <br/>
    <EmojiInfiniteScroll/>
  </n-layout-content>
  </n-modal-provider>
</template>