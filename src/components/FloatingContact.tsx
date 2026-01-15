import iconZalo from '../assets/icon-zalo.png';
import iconMessenger from '../assets/icon-messenger.png';
import iconCall from '../assets/icon-call.png';

export default function FloatingContact() {
    return (
        <div className="fixed bottom-10 right-2 z-50 flex flex-col gap-3">
            {/* Zalo - Square icon needs padding */}
            <a
                href="https://zalo.me/0868899104"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-white rounded-full shadow-lg shadow-blue-900/20 flex items-center justify-center hover:scale-110 transition-transform duration-300 p-2"
                title="Chat Zalo"
            >
                <img src={iconZalo} alt="Zalo" className="w-full h-full object-contain" />
            </a>

            {/* Messenger - Round icon needs less padding */}
            <a
                href="https://zalo.me/0868899104"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-white rounded-full shadow-lg shadow-blue-900/20 flex items-center justify-center hover:scale-110 transition-transform duration-300 p-1.5"
                title="Chat Zalo"
            >
                <img src={iconMessenger} alt="Messenger" className="w-full h-full object-contain" />
            </a>

            {/* Call - Custom shape needs padding */}
            <a
                href="https://zalo.me/0868899104"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 bg-white rounded-full shadow-lg shadow-blue-900/20 flex items-center justify-center hover:scale-110 transition-transform duration-300 p-3"
                title="Chat Zalo"
            >
                <img src={iconCall} alt="Call" className="w-full h-full object-contain" />
            </a>
        </div>
    );
}
