// src/utils/cosService.ts
import axios from 'axios'

// 腾讯云COS配置
const COS_CONFIG = {
    bucket: 'your-bucket-name',
    region: 'ap-guangzhou',  // 替换为你的存储桶所在地区
    baseUrl: 'https://your-bucket-name.cos.ap-guangzhou.myqcloud.com',
    cdnBaseUrl: 'https://your-cdn-domain.com', // 如果使用CDN加速
}

/**
 * 从COS获取对象URL (无鉴权的公开读取)
 * @param objectKey 对象键名（路径）
 * @param useCdn 是否使用CDN地址
 */
export const getCosPublicUrl = (objectKey: string, useCdn = true): string => {
    const baseUrl = useCdn ? COS_CONFIG.cdnBaseUrl : COS_CONFIG.baseUrl
    return `${baseUrl}/${objectKey}`
}

/**
 * 获取带签名的临时URL (适用于私有读取)
 * @param objectKey 对象键名
 * @param expireSeconds URL有效期(秒)
 */
export const getSignedUrl = async (objectKey: string, expireSeconds = 3600): Promise<string> => {
    try {
        // 假设你的服务器端有一个API用于生成签名URL
        const response = await axios.get('/api/cos/get-signed-url', {
            params: { objectKey, expireSeconds }
        })
        return response.data.signedUrl
    } catch (error) {
        console.error('获取签名URL失败:', error)
        // 失败时返回默认占位图
        return '/api/placeholder/300/300?text=加载失败'
    }
}

/**
 * 获取表情包图片URL
 * @param emojiId 表情包ID
 * @param size 图片尺寸 (small, medium, large)
 */
export const getEmojiImageUrl = (emojiId: number | string, size: 'small' | 'medium' | 'large' = 'medium'): string => {
    // 构建对象路径
    const sizePath = size === 'small' ? 'thumbnails' : size === 'large' ? 'original' : 'medium'
    const objectKey = `emojis/${sizePath}/doro-emoji-${emojiId}.png`

    // 假设表情图片是公开访问的
    return getCosPublicUrl(objectKey)
}

/**
 * 获取随机表情包
 */
export const getRandomEmojiUrl = async (): Promise<string> => {
    try {
        // 假设服务器有一个API用于获取随机表情
        const response = await axios.get('/api/emojis/random')
        return response.data.imageUrl
    } catch (error) {
        console.error('获取随机表情失败:', error)
        return '/api/placeholder/300/300?text=Random'
    }
}

/**
 * 上传表情包到COS
 * @param file 文件对象
 */
export const uploadEmojiToCos = async (file: File): Promise<string> => {
    try {
        // 创建FormData用于上传
        const formData = new FormData()
        formData.append('file', file)

        // 调用你的上传API
        const response = await axios.post('/api/cos/upload-emoji', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        return response.data.imageUrl
    } catch (error) {
        console.error('上传表情包失败:', error)
        throw new Error('上传失败，请重试')
    }
}