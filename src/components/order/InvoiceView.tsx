import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { formatPrice } from '../../utils/formatPrice';
import type { InvoiceData } from '../../types/profile';

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<InvoiceData['invoice'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getOrderInvoice(id!);
      setInvoice(data.invoice);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Đang tải hóa đơn...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>{error || 'Không tìm thấy hóa đơn'}</p>
        <Link to="/profile" style={{ color: '#2563eb', textDecoration: 'none' }}>
          Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', background: '#ffffff' }}>
      {/* Print styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .invoice-container, .invoice-container * {
              visibility: visible;
            }
            .invoice-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Actions - Hidden when printing */}
      <div className="no-print" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={handlePrint}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🖨️ In hóa đơn
        </button>
        <Link
          to={`/orders/${id}`}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Quay lại
        </Link>
      </div>

      {/* Invoice Content */}
      <div className="invoice-container">
        {/* Header */}
        <div style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>
            HÓA ĐƠN BÁN HÀNG
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
            Mã đơn hàng: <strong>#{invoice.orderNumber}</strong>
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Ngày tạo: {new Date(invoice.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>

        {/* Company Info & Customer Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
              Thông tin cửa hàng
            </h3>
            <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.75' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>KeyT Shop</p>
              <p style={{ margin: 0 }}>Email: support@keytshop.com</p>
              <p style={{ margin: 0 }}>Website: keytshop.com</p>
            </div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
              Thông tin khách hàng
            </h3>
            <div style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.75' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{invoice.customer.name}</p>
              <p style={{ margin: 0 }}>Email: {invoice.customer.email}</p>
              <p style={{ margin: 0 }}>Số điện thoại: {invoice.customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Trạng thái đơn: </span>
              <strong style={{ color: '#1f2937' }}>
                {invoice.orderStatus === 'pending' ? 'Chờ xử lý' :
                 invoice.orderStatus === 'confirmed' ? 'Đã xác nhận' :
                 invoice.orderStatus === 'processing' ? 'Đang xử lý' :
                 invoice.orderStatus === 'completed' ? 'Hoàn thành' :
                 invoice.orderStatus === 'cancelled' ? 'Đã hủy' : invoice.orderStatus}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Thanh toán: </span>
              <strong style={{ color: '#1f2937' }}>
                {invoice.paymentStatus === 'paid' ? 'Đã thanh toán' :
                 invoice.paymentStatus === 'pending' ? 'Chờ thanh toán' :
                 invoice.paymentStatus === 'failed' ? 'Thanh toán thất bại' : invoice.paymentStatus}
              </strong>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
            Chi tiết sản phẩm
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e5e5' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>STT</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Tên sản phẩm</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Số lượng</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Đơn giá</th>
                <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#374151' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.75rem', color: '#374151' }}>{index + 1}</td>
                  <td style={{ padding: '0.75rem', color: '#374151' }}>{item.name}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#374151' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#374151' }}>
                    {formatPrice(item.price, item.currency)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#374151', fontWeight: 600 }}>
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid #e5e5e5' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>Tổng tiền:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                {formatPrice(invoice.totalAmount, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.note && (
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
              Ghi chú khách hàng:
            </h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'pre-line' }}>
              {invoice.note}
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e5e5', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
            Cảm ơn bạn đã mua sắm tại KeyT Shop!
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
            Hóa đơn này được tạo tự động và có giá trị pháp lý.
          </p>
        </div>
      </div>
    </div>
  );
}

