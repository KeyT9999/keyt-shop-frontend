import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';


export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (message: string, type?: NotificationType) => void;
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
        const newNotification: Notification = { id, message, type };

        setNotifications((prev) => [...prev, newNotification]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 3000);
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};
