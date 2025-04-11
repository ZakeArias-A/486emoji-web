// src/utils/mockData.ts

// 表情包分类
import { v4 as uuidv4 } from 'uuid';
import type {GuidType} from "@/main.ts";

export const categories = [
    { label: "全部", value: "all" },
    { label: "可爱", value: "cute" },
    { label: "搞笑", value: "funny" },
    { label: "表情", value: "expression" },
    { label: "日常", value: "daily" }
]

// 排序选项
export const sortOptions = [
    { label: "最受欢迎", value: "popular" },
    { label: "最新上传", value: "newest" },
    { label: "最多下载", value: "downloads" }
]

// 模拟表情包数据类型
export interface EmojiItem {
    id: GuidType
    title: string
    likes: number
    category: { label: string, value: string };
    image: string
}

// 模拟创建单个表情包数据
const createMockEmoji = (id: GuidType): EmojiItem => {
    const categoryIndex = Math.floor(Math.random() * (categories.length - 1)) + 1
    return {
        id,
        title: `Doro表情包 ${id}`,
        likes: Math.floor(Math.random() * 100),
        category: categories[categoryIndex],
        // 仅用于开发阶段的模拟数据
        image: `https://img.moegirl.org.cn/common/thumb/2/2e/GBC_thum_subaru.png/60px-GBC_thum_subaru.png`//`/api/placeholder/300/300?text=Doro${Math.floor(id / 100)}-${id % 100 + 1}`
    }
}

// 生成批量模拟数据
export const generateMockData = (page: number, count = 1): EmojiItem[] => {
    return Array.from({ length: count }, (_, i) => createMockEmoji(uuidv4()))
}

// 模拟API请求延迟
export const mockDelay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

// 模拟API请求
export const fetchMockEmojis = async (page: number, filter?: any): Promise<EmojiItem[]> => {
    await mockDelay(1500)
    let data = generateMockData(page)

    // 如果有过滤条件
    if (filter) {
        // 这里可以添加模拟过滤逻辑
    }

    return data
}