
```vue
<template>
  <div class="emoji-infinite-scroll-container">
    <!-- 搜索栏组件 -->
    <div class="search-bar-container">
      <n-card embedded :bordered="false" class="search-card">
        <n-space vertical :size="12">
          <n-input
              v-model:value="searchKeyword"
              placeholder="搜索表情包..."
              clearable
              @keydown.enter="handleSearch"
          >
            <template #prefix>
              <n-icon :component="SearchIcon" />
            </template>
            <template #suffix>
              <n-button
                  quaternary
                  circle
                  type="primary"
                  size="small"
                  @click="handleSearch"
              >
                <template #icon>
                  <n-icon :component="ArrowRightIcon" />
                </template>
              </n-button>
            </template>
          </n-input>

          <n-space align="center" justify="space-between">
            <!-- 分类筛选 -->
            <n-select
                v-model:value="currentFilter.category.label"
                :options="categories.map(c => ({ label: c.label, value: c.value }))"
                size="small"
                style="width: 100px"
                @update:value="handleCategoryChange"
            />

            <!-- 排序方式 -->
            <n-select
                v-model:value="currentFilter.sort"
                :options="sortOptions.map(s => ({ label: s.label, value: s.value }))"
                size="small"
                style="width: 120px"
                @update:value="handleSortChange"
            />
          </n-space>
        </n-space>
      </n-card>
    </div>

    <!-- 无限滚动列表 -->
    <n-infinite-scroll
        :distance="100"
        :on-load="loadMoreEmojis"
        :scrollbar-props="{
        trigger: 'hover',
        xScrollable: false
      }"
    >
      <n-grid cols="2 s:3 m:4 l:5 xl:6 2xl:8" responsive="screen" :x-gap="16" :y-gap="16">
        <n-grid-item v-for="item in emojiItems" :key="item.id">
          <n-card :bordered="false" hoverable class="emoji-card">
            <template #cover>
              <n-image
                  style="padding: 1rem"
                  height="200rem"
                  :src="item.image"
                  :alt="item.title"
                  object-fit="contain"
                  show-toolbar-tooltip
                  :preview-disabled="false"
                  class="emoji-image"
              />
            </template>

            <n-flex vertical size="small">
              <n-flex justify="space-between" align="start" vertical>
                <n-text class="emoji-title">{{ item.title }}</n-text>
                <n-tag type="success" size="small">{{ item.category.label }}</n-tag>
                <br>
              </n-flex>

              <n-space justify="space-between" align="center">
                <n-space align="center" size="small">
                  <n-icon :component="Heart" />
                  <n-text depth="3">{{ item.likes }}</n-text>
                </n-space>
                <n-button tertiary circle type="primary" @click="downloadEmoji(item)" size="small">
                  <template #icon>
                    <n-icon :component="CloudDownload" />
                  </template>
                </n-button>
              </n-space>
            </n-flex>
          </n-card>
        </n-grid-item>
      </n-grid>

      <n-empty v-if="emojiItems.length === 0 && !loading" description="没有找到匹配的表情包" />

      <n-space v-if="loading" justify="center" class="loading-container">
        <n-spin size="small" />
        <n-text depth="3">加载中...</n-text>
      </n-space>

      <n-space v-if="!hasMore && emojiItems.length > 0" justify="center" class="end-container">
        <n-text depth="3">已加载全部内容</n-text>
      </n-space>
    </n-infinite-scroll>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  NInfiniteScroll,
  NCard,
  NImage,
  NSpace,
  NTag,
  NIcon,
  NText,
  NButton,
  NGrid,
  NGridItem,
  NSpin,
  NInput,
  NSelect,
  NEmpty
} from 'naive-ui';
import {CloudDownload, Heart} from '@vicons/ionicons5';
import { Search as SearchIcon, ArrowBack as ArrowRightIcon } from '@vicons/ionicons5';
import { useEmojiDataService, type EmojiFilter, categories, sortOptions } from '@/utils/emojiDataService.ts';
import type {EmojiItem} from "@/utils/mockData.ts";

// 定义GuidType类型
// Props 定义
interface Props {
  initialItems?: EmojiItem[];
  pageSize?: number;
  customFetch?: (page: number, pageSize: number, filter?: EmojiFilter) => Promise<EmojiItem[]>;
}

// Props 声明
const props = withDefaults(defineProps<Props>(), {
  initialItems: () => [],
  pageSize: 10,
  customFetch: undefined
});

// Emits 声明
const emit = defineEmits<{
  (e: 'load-success', items: EmojiItem[]): void;
  (e: 'load-error', error: Error): void;
  (e: 'download', item: EmojiItem): void;
  (e: 'filter-change', filter: EmojiFilter): void;
  (e: 'search', keyword: string): void;
}>();

// 数据状态
const emojiItems = ref<EmojiItem[]>(props.initialItems || []);
const page = ref<number>(0);
const loading = ref<boolean>(false);
const hasMore = ref<boolean>(true);
const searchKeyword = ref<string>('');

// 过滤器
const currentFilter = ref<EmojiFilter>({
  category: { label: "全部", value: "all" },
  sort: 'popular',
  keyword: ''
});

// 使用表情包数据服务
const {
  fetchEmojiData,
  updateFilter,
  categories: availableCategories,
  sortOptions: availableSortOptions
} = useEmojiDataService({
  pageSize: props.pageSize,
  initialFilter: currentFilter.value,
  customFetch: props.customFetch
});

// 重置列表数据
const resetList = () => {
  emojiItems.value = [];
  page.value = 0;
  hasMore.value = true;
};

// 搜索处理
const handleSearch = () => {
  // 更新过滤条件
  currentFilter.value.keyword = searchKeyword.value;

  // 重置列表并重新加载
  resetList();
  loadMoreEmojis();

  // 触发搜索事件
  emit('search', searchKeyword.value);
  emit('filter-change', { ...currentFilter.value });
};

// 分类变更处理
const handleCategoryChange = (category: string) => {
  currentFilter.value.category.value = category;
  resetList();
  loadMoreEmojis();
  emit('filter-change', { ...currentFilter.value });
};

// 排序变更处理
const handleSortChange = (sort: string) => {
  currentFilter.value.sort = sort;
  resetList();
  loadMoreEmojis();
  emit('filter-change', { ...currentFilter.value });
};

// 加载更多表情包
const loadMoreEmojis = async (): Promise<void> => {
  if (loading.value || !hasMore.value) return Promise.resolve();

  loading.value = true;
  try {
    // 更新过滤条件
    updateFilter(currentFilter.value);

    // 获取表情包数据
    const newItems = await fetchEmojiData(page.value);
    if (newItems.length === 0) {
      hasMore.value = false;
    } else {
      emojiItems.value = [...emojiItems.value, ...newItems];
      page.value += 1;
      emit('load-success', newItems);
    }
  } catch (error) {
    console.error("加载表情包失败", error);
    emit('load-error', error as Error);
  } finally {
    loading.value = false;
  }

  return Promise.resolve();
};

// 下载表情包
const downloadEmoji = (item: EmojiItem): void => {
  window.open(item.image, '_blank');
  emit('download', item);
};

// 监听过滤条件变化
watch(
    currentFilter,
    (newFilter) => {
      updateFilter(newFilter);
    },
    { deep: true }
);

// 暴露方法给父组件
defineExpose({
  resetList,
  updateFilter: (filter: Partial<EmojiFilter>) => {
    currentFilter.value = {
      ...currentFilter.value,
      ...filter
    };
    resetList();
    loadMoreEmojis();
  },
  setSearchKeyword: (keyword: string) => {
    searchKeyword.value = keyword;
  }
});

// 初始加载
onMounted(() => {
  if (emojiItems.value.length === 0) {
    loadMoreEmojis();
  }
});
</script>

<style scoped>
.emoji-infinite-scroll-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-bar-container {
  margin-bottom: 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-card {
  backdrop-filter: blur(10px);
}

.emoji-card {
  transition: all 0.3s;
}

.emoji-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.emoji-image {
  aspect-ratio: 1;
  border-radius: 4px;
  overflow: hidden;
}

.emoji-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loading-container, .end-container {
  padding: 16px 0;
}
</style>
```
