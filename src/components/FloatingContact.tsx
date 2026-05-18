import iconZalo from '../assets/icon-zalo.png';

export default function FloatingContact() {
    return (
        <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3 items-center">
            {/* Zalo */}
            <a
                href="https://zalo.me/0868899104"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform duration-300 p-2"
                title="Chat Zalo"
            >
                <img src={iconZalo} alt="Zalo" className="w-full h-full object-contain" />
            </a>
        </div>
    );
}
