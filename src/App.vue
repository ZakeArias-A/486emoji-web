<script setup lang="ts">

import { darkTheme ,lightTheme } from 'naive-ui'
import {onMounted, ref} from 'vue'
// import {Moon, Sunny} from "@vicons/ionicons5";
// import EmojiContent from "@/components/EmojiContent.vue";
import DialogProvider from '@/components/dialog/DialogProvider.vue';

// 页面标题
//const appTitle = ref('Doro 表情包')

const theme = ref(darkTheme)
const isDark = ref(false)
onMounted(() => {
  isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  theme.value = isDark.value?darkTheme:lightTheme
})

</script>

<template>
  <n-config-provider :theme="theme">
    <n-layout position="absolute" :native-scrollbar="false">
<!--      <n-layout-header>
              <n-flex justify="end">
                <n-switch
                    :default-value="!isDark"
                    @update:value="(value:boolean) => theme = !value?lightTheme:darkTheme"
                    size="large">
                  <template #unchecked-icon>
                    <n-icon :component="Sunny" />
                  </template>
                  <template #checked-icon>
                    <n-icon :component="Moon" />
                  </template>
                </n-switch>
              </n-flex>
      </n-layout-header>-->
      <n-layout-content >
        <center>
          <DialogProvider/>
        </center>
      </n-layout-content>
    </n-layout>
  </n-config-provider>
</template>

<style scoped>

</style>