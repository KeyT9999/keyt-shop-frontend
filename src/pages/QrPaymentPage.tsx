import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

export default function QrPaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // In a real implementation, use orderId to fetch data
    const orderId = searchParams.get('orderId');
    console.log('Payment for order:', orderId);

    // Mock data based on screenshot - in real app would come from API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [paymentData] = useState({
        bankName: "Ngân hàng TMCP Quân Đội",
        accountName: "TRAN KIM THANG",
        accountNumber: "VQRQAGMYD8328",
        amount: "189,000",
        description: "Don hang",
        qrUrl: "https://img.vietqr.io/image/MB-VQRQAGMYD8328-compact2.jpg?amount=189000&addInfo=Don%20hang&accountName=TRAN%20KIM%20THANG", // Using dynamic VietQR API for demo
        orderCode: "123456"
    });

    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCancel = () => {
        // Navigate back or to order details
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] py-8 px-4 flex justify-center items-start">
            <div className="w-full max-w-4xl">
                {/* Header Branding (Optional, matching screenshot top bar) */}
                {/* <div className="flex justify-between items-center mb-6 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="font-bold text-gray-700">MINDORA AI</span>
          </div>
          <div className="text-[#00B14F] font-bold text-xl flex items-center gap-1">
            <span className="text-2xl font-extrabold">payOS</span>
          </div>
        </div> */}

                {/* Main Card */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* Card Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
                        <h2 className="text-lg font-medium text-gray-700">Chi tiết đơn hàng</h2>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            Xem
                        </button>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 md:p-8">
                        {/* Guide Text */}
                        <div className="flex items-start gap-3 mb-8 text-sm text-gray-600 justify-center">
                            <span className="text-xl">💡</span>
                            <p>
                                Mở App Ngân hàng bất kỳ để <span className="font-bold text-gray-800">quét mã VietQR</span> hoặc <span className="font-bold text-gray-800">chuyển khoản</span> chính xác số tiền bên dưới
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start justify-center">
                            {/* Left Column: QR Code */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-[280px]">
                                    {/* VietQR Pro Header */}
                                    <div className="flex items-center gap-1 mb-2 px-2">
                                        <span className="text-red-600 font-bold text-lg">VietQR</span>
                                        <div className="bg-yellow-400 text-white text-xs font-bold px-1 rounded transform skew-x-[-10deg]">
                                            PRO
                                        </div>
                                    </div>

                                    {/* QR Image */}
                                    <div className="aspect-square bg-gray-50 mb-2 relative">
                                        <img
                                            src={paymentData.qrUrl}
                                            alt="Payment QR Code"
                                            className="w-full h-full object-contain"
                                        />
                                        {/* Center Logo Overlay (Optional styling) */}
                                        {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded">
                       <span className="text-red-500 font-bold">V</span>
                     </div> */}
                                    </div>

                                    {/* Footer Icons */}
                                    <div className="flex justify-center items-center gap-4 text-xs text-blue-600 font-medium mt-1">
                                        <span>napas247</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-blue-800 font-bold text-sm">MB</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Bank Details */}
                            <div className="flex-1 max-w-md w-full">
                                {/* Bank Name Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        MB
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-sm">Ngân hàng</div>
                                        <div className="font-bold text-gray-800">Ngân hàng TMCP Quân Đội</div>
                                    </div>
                                </div>

                                {/* Account Owner */}
                                <div className="mb-4">
                                    <div className="text-gray-500 text-sm mb-1">Chủ tài khoản:</div>
                                    <div className="font-bold text-gray-800 text-lg uppercase">{paymentData.accountName}</div>
                                </div>

                                {/* Account Number */}
                                <div className="mb-4">
                                    <div className="text-gray-500 text-sm mb-1">Số tài khoản:</div>
                                    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-lg py-2 px-3 shadow-sm hover:border-green-200 transition-colors">
                                        <span className="font-bold text-gray-800 text-lg tracking-wide">{paymentData.accountNumber}</span>
                                        <button
                                            onClick={() => handleCopy(paymentData.accountNumber, 'accountNumber')}
                                            className="text-[#00B14F] hover:bg-green-50 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                                        >
                                            {copiedField === 'accountNumber' ? (
                                                <>Đã chép <Check size={14} /></>
                                            ) : (
                                                'Sao chép'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="mb-4">
                                    <div className="text-gray-500 text-sm mb-1">Số tiền:</div>
                                    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-lg py-2 px-3 shadow-sm hover:border-green-200 transition-colors">
                                        <span className="font-bold text-gray-800 text-lg">{paymentData.amount} vnd</span>
                                        <button
                                            onClick={() => handleCopy(paymentData.amount.replace(/,/g, ''), 'amount')}
                                            className="text-[#00B14F] hover:bg-green-50 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                                        >
                                            {copiedField === 'amount' ? (
                                                <>Đã chép <Check size={14} /></>
                                            ) : (
                                                'Sao chép'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mb-8">
                                    <div className="text-gray-500 text-sm mb-1">Nội dung:</div>
                                    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-lg py-2 px-3 shadow-sm hover:border-green-200 transition-colors">
                                        <span className="font-bold text-gray-800 text-lg">{paymentData.description}</span>
                                        <button
                                            onClick={() => handleCopy(paymentData.description, 'description')}
                                            className="text-[#00B14F] hover:bg-green-50 px-3 py-1 rounded text-sm font-medium flex items-center gap-1 transition-colors"
                                        >
                                            {copiedField === 'description' ? (
                                                <>Đã chép <Check size={14} /></>
                                            ) : (
                                                'Sao chép'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500 mb-8 leading-relaxed">
                                    Lưu ý: Nhập chính xác số tiền <span className="font-bold text-black">{paymentData.amount}</span> khi chuyển khoản
                                </div>

                            </div>
                        </div>

                        {/* Cancel Button */}
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleCancel}
                                className="px-8 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Huỷ
                            </button>
                        </div>

                    </div>
                </div>

                {/* Footer (Optional) */}
                {/* <div className="mt-8 text-center text-sm text-gray-400">
          Powered by payOS
        </div> */}
            </div>
        </div>
    );
}
