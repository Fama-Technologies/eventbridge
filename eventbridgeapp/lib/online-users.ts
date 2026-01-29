// lib/online-users.ts
// Track online users (in production, use Redis)
const onlineUsers = new Set<number>();

export function markUserOnline(userId: number): void {
    onlineUsers.add(userId);
}

export function markUserOffline(userId: number): void {
    onlineUsers.delete(userId);
}

export function isUserOnline(userId: number): boolean {
    return onlineUsers.has(userId);
}

export function getOnlineUsers(): number[] {
    return Array.from(onlineUsers);
}