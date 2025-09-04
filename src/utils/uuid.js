// src/utils/uuid.js
/**
 * 生成全局唯一标识符(UUID)
 * @returns {string} UUID字符串
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 获取或创建用户UUID
 * @returns {string} 用户UUID
 */
export function getUserUUID() {
    // 检查localStorage中是否已存在UUID
    let uuid = localStorage.getItem('user_uuid');

    // 如果不存在，则生成新的UUID并保存
    if (!uuid) {
        uuid = generateUUID();
        localStorage.setItem('user_uuid', uuid);
    }

    return uuid;
}

export default {
    generateUUID,
    getUserUUID
};
