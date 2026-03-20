import { useCallback, useEffect, useMemo, useState } from 'react';
import { netflixService } from '../../services/netflixService';
import type { NetflixReplacementTicketSummary, Order, TiemBanhNetflixSlot } from '../../types/profile';
import { useAuthContext } from '../../context/useAuthContext';

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Đã hết hạn';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}g ${m}p ${s}s`;
  if (m > 0) return `${m}p ${s}s`;
  return `${s}s`;
}

function useTokenCountdown(tokenExpires?: number): number | null {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (tokenExpires == null) {
      setLeft(null);
      return;
    }
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      setLeft(Math.max(0, tokenExpires - now));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [tokenExpires]);
  return left;
}

function slotStatusLabel(status?: string): string {
  switch (status) {
    case 'ok':
      return 'Đã cấp — sẵn sàng';
    case 'failed':
      return 'Cấp cookie thất bại — liên hệ hỗ trợ';
    case 'pending':
    default:
      return 'Đang chờ cấp (sau khi thanh toán thành công)';
  }
}

interface NetflixSlotCardProps {
  order: Order;
  itemIndex: number;
  slotIndex: number;
  slot: TiemBanhNetflixSlot;
  ticket: NetflixReplacementTicketSummary | undefined;
  onRefresh: () => void;
  onTicketsRefresh: () => void;
}

function NetflixSlotCard({
  order,
  itemIndex,
  slotIndex,
  slot,
  ticket,
  onRefresh,
  onTicketsRefresh
}: NetflixSlotCardProps) {
  const countdown = useTokenCountdown(slot.tokenExpires);
  const [regenLoading, setRegenLoading] = useState(false);
  const [provisionLoading, setProvisionLoading] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const canRegen =
    order.paymentStatus === 'paid' && slot.provisionStatus === 'ok' && Boolean(slot.logId);

  const copyCookie = async () => {
    if (!slot.cookie) return;
    try {
      await navigator.clipboard.writeText(slot.cookie);
      setLocalMessage('Đã copy cookie.');
      window.setTimeout(() => setLocalMessage(null), 2500);
    } catch {
      setLocalError('Không copy được — chọn và copy thủ công.');
    }
  };

  const handleRegen = async () => {
    setLocalError(null);
    setRegenLoading(true);
    try {
      await netflixService.regenLink(order._id, itemIndex, slotIndex);
      onRefresh();
      setLocalMessage('Đã làm mới link.');
      window.setTimeout(() => setLocalMessage(null), 2500);
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setLocalError(msg || 'Không làm mới được link.');
    } finally {
      setRegenLoading(false);
    }
  };

  const handleReplacementRequest = async () => {
    setLocalError(null);
    if (!evidence.trim()) {
      setLocalError('Vui lòng mô tả lỗi hoặc dán link ảnh / bằng chứng.');
      return;
    }
    setRequestLoading(true);
    try {
      await netflixService.createReplacementRequest(order._id, itemIndex, slotIndex, evidence.trim());
      setEvidence('');
      setLocalMessage('Đã gửi yêu cầu — chờ shop duyệt.');
      await onTicketsRefresh();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setLocalError(msg || 'Gửi yêu cầu thất bại.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleProvision = async () => {
    if (!ticket?._id) return;
    setLocalError(null);
    setProvisionLoading(true);
    try {
      await netflixService.provisionReplacement(ticket._id);
      setLocalMessage('Đã cấp cookie mới.');
      onRefresh();
      onTicketsRefresh();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setLocalError(msg || 'Cấp cookie mới thất bại.');
    } finally {
      setProvisionLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: '0.75rem',
        padding: '1rem',
        background: '#0f0f0f',
        borderRadius: '8px',
        border: '1px solid rgba(229,9,20,0.35)',
        color: '#e5e5e5'
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>
        Slot #{slotIndex + 1}{' '}
        <span style={{ fontWeight: 400, fontSize: '0.8rem', color: '#a3a3a3' }}>
          — {slotStatusLabel(slot.provisionStatus)}
        </span>
      </div>

      {localMessage && (
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#4ade80' }}>{localMessage}</p>
      )}
      {localError && (
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#f87171' }}>{localError}</p>
      )}

      {slot.provisionStatus === 'ok' && (
        <>
          {slot.tokenExpires != null && countdown !== null && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.875rem' }}>
              Link còn hiệu lực: <strong>{formatCountdown(countdown)}</strong>
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {slot.pcLoginLink ? (
              <a
                href={slot.pcLoginLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.45rem 0.85rem',
                  background: '#e50914',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Mở link PC
              </a>
            ) : null}
            {slot.mobileLoginLink ? (
              <a
                href={slot.mobileLoginLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '0.45rem 0.85rem',
                  background: '#262626',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid #404040'
                }}
              >
                Mở link Mobile
              </a>
            ) : null}
            {slot.cookie ? (
              <button
                type="button"
                onClick={copyCookie}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: '#262626',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px solid #404040',
                  cursor: 'pointer'
                }}
              >
                Copy cookie
              </button>
            ) : null}
            <button
              type="button"
              disabled={!canRegen || regenLoading}
              onClick={handleRegen}
              style={{
                padding: '0.45rem 0.85rem',
                background: canRegen ? '#1d4ed8' : '#4b5563',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: canRegen && !regenLoading ? 'pointer' : 'not-allowed',
                opacity: regenLoading ? 0.7 : 1
              }}
            >
              {regenLoading ? 'Đang làm mới…' : 'Làm mới link'}
            </button>
          </div>
        </>
      )}

      {order.paymentStatus === 'paid' && (
        <div style={{ borderTop: '1px solid #333', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#a3a3a3', marginBottom: '0.35rem' }}>
            Báo lỗi / xin đổi cookie (shop duyệt sau)
          </div>
          {ticket?.status === 'pending' && (
            <p style={{ fontSize: '0.85rem', color: '#fbbf24', margin: '0 0 0.5rem' }}>
              Yêu cầu đang chờ duyệt.
            </p>
          )}
          {ticket?.status === 'rejected' && (
            <>
              <p style={{ fontSize: '0.85rem', color: '#f87171', margin: '0 0 0.35rem' }}>
                Yêu cầu trước đã bị từ chối. Bạn có thể gửi lại với bằng chứng rõ hơn.
              </p>
              {ticket.decisionReason && (
                <p style={{ fontSize: '0.82rem', color: '#fca5a5', margin: '0 0 0.5rem' }}>
                  Lý do shop: {ticket.decisionReason}
                </p>
              )}
            </>
          )}
          {ticket?.status === 'approved' && !ticket.consumed && (
            <>
              {ticket.decisionReason && (
                <p style={{ fontSize: '0.82rem', color: '#86efac', margin: '0 0 0.5rem' }}>
                  Ghi chú shop: {ticket.decisionReason}
                </p>
              )}
              <button
                type="button"
                disabled={provisionLoading}
                onClick={handleProvision}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#15803d',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: provisionLoading ? 'wait' : 'pointer',
                  marginBottom: '0.5rem'
                }}
              >
                {provisionLoading ? 'Đang cấp…' : 'Lấy cookie mới (sau khi được duyệt)'}
              </button>
            </>
          )}
          {(!ticket ||
            ticket.status === 'rejected' ||
            (ticket.status === 'approved' && ticket.consumed)) &&
            ticket?.status !== 'pending' && (
            <>
              <textarea
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="Mô tả lỗi, hoặc dán link ảnh / video minh chứng…"
                rows={3}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '6px',
                  border: '1px solid #404040',
                  background: '#171717',
                  color: '#fafafa',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem',
                  resize: 'vertical'
                }}
              />
              <button
                type="button"
                disabled={requestLoading}
                onClick={handleReplacementRequest}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: '#ca8a04',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: requestLoading ? 'wait' : 'pointer'
                }}
              >
                {requestLoading ? 'Đang gửi…' : 'Gửi yêu cầu đổi cookie'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface NetflixOrderItemSlotsProps {
  order: Order;
  itemIndex: number;
  item: Order['items'][number];
  onRefresh: () => void;
}

export default function NetflixOrderItemSlots({ order, itemIndex, item, onRefresh }: NetflixOrderItemSlotsProps) {
  const { user } = useAuthContext();
  const slots = item.tiemBanhSlots;
  const [tickets, setTickets] = useState<NetflixReplacementTicketSummary[]>([]);

  const loadTickets = useCallback(async () => {
    if (!user) return;
    try {
      const { tickets: list } = await netflixService.listMyTickets();
      setTickets(list || []);
    } catch {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    if (user && order.paymentStatus === 'paid' && slots?.length) {
      loadTickets();
    }
  }, [user, order._id, order.paymentStatus, slots?.length, loadTickets]);

  const ticketForSlot = useMemo(() => {
    return (slotIndex: number) => {
      const relevant = tickets
        .filter(
          (t) =>
            String(t.orderId) === String(order._id) &&
            t.itemIndex === itemIndex &&
            t.slotIndex === slotIndex
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      const active = relevant.find(
        (t) => t.status === 'pending' || (t.status === 'approved' && !t.consumed)
      );
      return active || relevant[0];
    };
  }, [tickets, order._id, itemIndex]);

  if (!slots?.length) return null;

  return (
    <div style={{ marginTop: '0.5rem', width: '100%' }}>
      <div
        style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#e50914',
          fontWeight: 700,
          marginBottom: '0.35rem'
        }}
      >
        Netflix Tiệm Bánh
      </div>
      {slots.map((slot, slotIndex) => (
        <NetflixSlotCard
          key={slotIndex}
          order={order}
          itemIndex={itemIndex}
          slotIndex={slotIndex}
          slot={slot}
          ticket={ticketForSlot(slotIndex)}
          onRefresh={onRefresh}
          onTicketsRefresh={loadTickets}
        />
      ))}
    </div>
  );
}
