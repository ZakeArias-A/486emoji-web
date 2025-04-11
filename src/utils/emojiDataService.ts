/**
 * 表情包数据服务 - 处理所有与网络加载相关的逻辑
 */
import { ref } from 'vue';
import {type EmojiItem, generateMockData} from "./mockData.ts";



// 表情包分类
export const categories = [
  { label: "全部", value: "all" },
  { label: "可爱", value: "cute" },
  { label: "搞笑", value: "funny" },
  { label: "表情", value: "expression" },
  { label: "日常", value: "daily" }
];

// 排序选项
export const sortOptions = [
  { label: "最受欢迎", value: "popular" },
  { label: "最新上传", value: "newest" },
  { label: "最多点赞", value: "likes" }
];


// 过滤器接口定义
export interface EmojiFilter {
  category?: { label: string, value: string };
  sort?: string;
  keyword?: string;
}

// 表情包数据服务选项
export interface EmojiDataServiceOptions {
  pageSize?: number;
  initialFilter?: EmojiFilter;
  useMockData?: boolean;
  apiUrl?: string;
  apiHeaders?: Record<string, string>;
  customFetch?: (page: number, pageSize: number, filter?: EmojiFilter) => Promise<EmojiItem[]>;
}

// 分页响应数据接口
export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  hasMore: boolean;
}

/**
 * 表情包数据服务Hook
 * @param options 配置选项
 * @returns 数据服务方法和状态
 */
export function useEmojiDataService(options: EmojiDataServiceOptions = {}) {
  const {
    pageSize = 10,
    initialFilter = {},
    useMockData = true,
    apiUrl = '/api/emojis',
    apiHeaders = {},
    customFetch
  } = options;

  // 状态
  const loading = ref<boolean>(false);
  const error = ref<Error | null>(null);
  const filter = ref<EmojiFilter>(initialFilter);
  const totalEmojis = ref<number | undefined>(undefined);

  /**
   * 从API获取表情包数据
   * @param page 页码
   * @param size 每页数量
   * @param currentFilter 过滤条件
   * @returns 分页响应数据
   */
  const fetchFromApi = async (
    page: number,
    size: number,
    currentFilter?: EmojiFilter
  ): Promise<PaginatedResponse<EmojiItem>> => {
    try {
      // 构建API请求URL
      const url = new URL(apiUrl, window.location.origin);

      // 添加分页参数
      url.searchParams.append('page', page.toString());
      url.searchParams.append('pageSize', size.toString());

      // 添加过滤参数
      if (currentFilter) {
        if (currentFilter.category && currentFilter.category.value !== 'all') {
          url.searchParams.append('category', currentFilter.category.value);
        }
        if (currentFilter.sort) {
          url.searchParams.append('sort', currentFilter.sort);
        }
        if (currentFilter.keyword) {
          url.searchParams.append('keyword', currentFilter.keyword);
        }
      }

      // 发送请求
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...apiHeaders
        }
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      return {
        data: result.data || [],
        total: result.total,
        hasMore: result.hasMore !== undefined
          ? result.hasMore
          : result.data.length === size
      };
    } catch (err) {
      console.error('API请求失败:', err);
      throw err;
    }
  };

  /**
   * 使用模拟数据
   * @param page 页码
   * @param size 每页数量
   * @param currentFilter 过滤条件
   * @returns 分页响应数据
   */
  const fetchMockData = async (
    page: number,
    size: number,
    currentFilter?: EmojiFilter
  ): Promise<PaginatedResponse<EmojiItem>> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // 生成模拟数据
      let mockData = generateMockData(page, size);

      // 应用过滤
      if (currentFilter) {
        // 分类过滤
        if (currentFilter.category && currentFilter.category.value !== 'all') {
          mockData = mockData.filter(item => item.category.value === currentFilter.category?.value);
        }

        // 关键词过滤
        if (currentFilter.keyword) {
          const keyword = currentFilter.keyword.toLowerCase();
          mockData = mockData.filter(item =>
            item.title.toLowerCase().includes(keyword)
          );
        }

        // 排序
        if (currentFilter.sort) {
          switch (currentFilter.sort) {
            case 'newest':
              // 假设id越大越新
              mockData.sort((a, b) => Number(b.id.split('-')[1]) - Number(a.id.split('-')[1]));
              break;
            case 'likes':
              mockData.sort((a, b) => b.likes - a.likes);
              break;
            // 默认按popular排序
            default:
              break;
          }
        }
      }

      // 模拟总数据量
      const total = 100;

      // 模拟是否还有更多数据 (最多显示5页)
      const hasMore = page < 5 && mockData.length > 0;

      return {
        data: mockData,
        total,
        hasMore
      };
    } catch (err) {
      console.error('获取模拟数据失败:', err);
      throw err;
    }
  };

  /**
   * 获取表情包数据
   * @param page 页码
   * @param currentFilter 过滤条件
   * @returns 表情包数据
   */
  const fetchEmojiData = async (
    page: number,
    currentFilter = filter.value
  ): Promise<EmojiItem[]> => {
    loading.value = true;
    error.value = null;

    try {
      let response: PaginatedResponse<EmojiItem>;

      // 根据配置决定使用哪种方式获取数据
      if (customFetch) {
        // 使用自定义的获取函数
        const data = await customFetch(page, pageSize, currentFilter);
        response = {
          data,
          hasMore: data.length === pageSize
        };
      } else if (useMockData) {
        // 使用模拟数据
        response = await fetchMockData(page, pageSize, currentFilter);
      } else {
        // 使用真实API
        response = await fetchFromApi(page, pageSize, currentFilter);
      }

      // 更新总数据量
      if (response.total !== undefined) {
        totalEmojis.value = response.total;
      }

      return response.data;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.value = errorObj;
      console.error('获取表情包数据失败:', errorObj);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新过滤条件
   * @param newFilter 新的过滤条件
   */
  const updateFilter = (newFilter: Partial<EmojiFilter>) => {
    filter.value = {
      ...filter.value,
      ...newFilter
    };
  };

  return {
    // 状态
    loading,
    error,
    filter,
    totalEmojis,

    // 方法
    fetchEmojiData,
    updateFilter,

    // 常量
    categories,
    sortOptions
  };
}

/**
 * 使用API创建自定义获取函数
 * @param apiUrl API地址
 * @param apiHeaders API请求头
 * @returns 自定义获取函数
 */
export function createApiDataFetcher(
  apiUrl: string,
  apiHeaders: Record<string, string> = {}
) {
  return async (
    page: number,
    pageSize: number,
    filter?: EmojiFilter
  ): Promise<EmojiItem[]> => {
    const url = new URL(apiUrl, window.location.origin);

    // 添加分页参数
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());

    // 添加过滤参数
    if (filter) {
      if (filter.category && filter.category.value !== 'all') {
        url.searchParams.append('category', filter.category.value);
      }
      if (filter.sort) {
        url.searchParams.append('sort', filter.sort);
      }
      if (filter.keyword) {
        url.searchParams.append('keyword', filter.keyword);
      }
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...apiHeaders
        }
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (err) {
      console.error('API请求失败:', err);
      throw err;
    }
  };
}
