import { useNotification } from '../context/NotificationContext';

export default function NotificationContainer() {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3 max-w-sm w-full">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`
                        relative overflow-hidden rounded-lg shadow-lg p-4 transition-all duration-500 animate-slide-in-left
                        bg-orange-100 border border-orange-200 text-orange-900
                    `}
                    role="alert"
                >
                    {/* Pastel Orange Side Accent */}
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-[#F05A28]"></div>

                    <div className="flex items-start gap-3 pl-2">
                        {/* Icon based on type - defaulting to check for success for now as per request */}
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="w-5 h-5 text-[#F05A28]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>

                        <div className="flex-1">
                            <p className="font-medium text-sm">{notification.message}</p>
                        </div>

                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-orange-400 hover:text-orange-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
