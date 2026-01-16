import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import type { Banner, BannerFormData } from '../../types/banner';
import { getAllBannersAdmin, createBanner, updateBanner, deleteBanner, uploadBannerImage } from '../../api/bannerApi';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, ExternalLink, Eye, EyeOff } from 'lucide-react';
import './AdminStyles.css';
import './AdminBannerPage.css';

export default function AdminBannerPage() {
    const { token } = useAuthContext();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const [formData, setFormData] = useState<BannerFormData>({
        title: '',
        description: '',
        imageUrl: '',
        link: '',
        position: 'hero',
        order: 0,
        isActive: true
    });

    const fetchBanners = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await getAllBannersAdmin(token);
            setBanners(data);
        } catch (error) {
            console.error('Failed to fetch banners', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            if (editingBanner) {
                await updateBanner(editingBanner._id, formData, token);
            } else {
                await createBanner(formData, token);
            }
            setIsModalOpen(false);
            setEditingBanner(null);
            resetForm();
            fetchBanners();
        } catch (error) {
            console.error('Failed to save banner', error);
            alert('Failed to save banner');
        }
    };

    const handleDelete = async (id: string) => {
        if (!token || !window.confirm('Are you sure you want to delete this banner?')) return;
        try {
            await deleteBanner(id, token);
            fetchBanners();
        } catch (error) {
            console.error('Failed to delete banner', error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        try {
            setUploading(true);
            const imageUrl = await uploadBannerImage(file, token);
            setFormData(prev => ({ ...prev, imageUrl }));
        } catch (error) {
            console.error('Failed to upload image', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!token) return;

            try {
                setUploading(true);
                const imageUrl = await uploadBannerImage(file, token);
                setFormData(prev => ({ ...prev, imageUrl }));
            } catch (error) {
                console.error('Failed to upload image', error);
                alert('Failed to upload image');
            } finally {
                setUploading(false);
            }
        }
    };

    const openEditModal = (banner: Banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title || '',
            description: banner.description || '',
            imageUrl: banner.imageUrl,
            link: banner.link || '',
            position: banner.position,
            order: banner.order,
            isActive: banner.isActive
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            imageUrl: '',
            link: '',
            position: 'hero',
            order: 0,
            isActive: true
        });
    };

    const getPositionLabel = (position: string) => {
        switch (position) {
            case 'hero': return 'Hero Slider';
            case 'flash_sale': return 'Flash Sale';
            case 'promo': return 'Promo Banner';
            case 'footer': return 'Footer';
            default: return position;
        }
    };

    return (
        <div className="banner-page" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ color: '#1E293B', fontSize: '2rem', fontWeight: 700, margin: '0 0 8px 0' }}>Banner Management</h1>
                        <p style={{ color: '#64748B', margin: 0 }}>Quản lý banner quảng cáo và hình ảnh</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingBanner(null);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        style={{
                            padding: '12px 24px',
                            background: '#F05A28',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Plus size={20} />
                        <span>Thêm Banner Mới</span>
                    </button>
                </div>

                <div className="banner-content">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '48px', color: '#64748B' }}>
                            <div className="spinner" style={{ borderColor: '#E2E8F0', borderTopColor: '#F05A28' }}></div>
                            <p style={{ marginTop: '16px' }}>Loading banners...</p>
                        </div>
                    ) : banners.length === 0 ? (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '64px',
                            textAlign: 'center',
                            border: '1px solid #E2E8F0',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                        }}>
                            <ImageIcon size={64} color="#94A3B8" strokeWidth={1} style={{ marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '1.25rem', color: '#1E293B', marginBottom: '8px' }}>Chưa có banner nào</h3>
                            <p style={{ color: '#64748B', marginBottom: '24px' }}>Hãy bắt đầu tạo chiến dịch quảng cáo đầu tiên</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{
                                    padding: '10px 20px',
                                    background: 'white',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '9999px',
                                    color: '#475569',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Plus size={18} />
                                Tạo Banner
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                            {banners.map((banner) => (
                                <div key={banner._id} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '1px solid #E2E8F0',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}>
                                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#F1F5F9' }}>
                                        <img
                                            src={banner.imageUrl}
                                            alt={banner.title || 'Banner'}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            display: 'flex',
                                            gap: '8px'
                                        }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openEditModal(banner); }}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: 'white',
                                                    border: 'none',
                                                    color: '#1E293B',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(banner._id); }}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: 'white',
                                                    border: 'none',
                                                    color: '#EF4444',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '12px'
                                        }}>
                                            {banner.isActive ? (
                                                <span style={{
                                                    background: 'rgba(22, 163, 74, 0.9)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    backdropFilter: 'blur(4px)'
                                                }}>
                                                    <Eye size={12} /> Active
                                                </span>
                                            ) : (
                                                <span style={{
                                                    background: 'rgba(100, 116, 139, 0.9)',
                                                    color: 'white',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    backdropFilter: 'blur(4px)'
                                                }}>
                                                    <EyeOff size={12} /> Hidden
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', lineHeight: '1.4' }}>
                                                {banner.title || 'Không có tiêu đề'}
                                            </h3>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                padding: '4px 8px',
                                                borderRadius: '9999px',
                                                background: '#F1F5F9',
                                                color: '#64748B',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {getPositionLabel(banner.position)}
                                            </span>
                                        </div>
                                        {banner.description && (
                                            <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: '#64748B', lineHeight: '1.5', flex: 1 }}>
                                                {banner.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>Thứ tự: <strong>{banner.order}</strong></span>
                                            {banner.link && (
                                                <a
                                                    href={banner.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F05A28', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Link <ExternalLink size={14} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(15, 23, 42, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 50,
                        padding: '20px'
                    }} onClick={() => setIsModalOpen(false)}>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', margin: 0 }}>
                                        {editingBanner ? 'Chỉnh sửa Banner' : 'Tạo Banner Mới'}
                                    </h2>
                                    <p style={{ margin: '4px 0 0 0', color: '#64748B', fontSize: '0.9rem' }}>Nhập thông tin chi tiết cho banner</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>Hình ảnh / URL <span style={{ color: '#EF4444' }}>*</span></label>

                                    {/* Simple Image Upload Area */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        style={{
                                            border: dragActive ? '2px dashed #F05A28' : '2px dashed #E2E8F0',
                                            borderRadius: '12px',
                                            padding: '20px',
                                            textAlign: 'center',
                                            background: dragActive ? '#FFF7ED' : '#F8FAFC',
                                            cursor: 'pointer',
                                            marginBottom: '12px',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: dragActive ? '#FFFFFF' : '#F1F5F9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: dragActive ? '#F05A28' : '#64748B'
                                        }}>
                                            <Upload size={24} />
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600, color: '#1E293B' }}>
                                                {uploading ? 'Đang tải ảnh lên...' : 'Kéo thả hoặc click để tải lên'}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                                                JPG, PNG, GIF (Max 5MB)
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />

                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ flex: 1, height: '1px', background: '#F1F5F9' }}></div>
                                        <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>HOẶC DÙNG URL</span>
                                        <div style={{ flex: 1, height: '1px', background: '#F1F5F9' }}></div>
                                    </div>

                                    {/* URL Input */}
                                    <input
                                        type="url"
                                        required
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #E2E8F0',
                                            background: '#ffffff',
                                            color: '#1E293B',
                                            fontSize: '0.95rem',
                                            marginBottom: '12px',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#F05A28';
                                            e.target.style.boxShadow = '0 0 0 1px #F05A28';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />

                                    {/* Preview */}
                                    {formData.imageUrl && (
                                        <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                                            <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '200px', objectFit: 'cover' }} />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'rgba(0,0,0,0.5)',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>Tiêu đề</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Nhập tiêu đề banner..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #E2E8F0',
                                            background: '#ffffff',
                                            color: '#1E293B',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#F05A28';
                                            e.target.style.boxShadow = '0 0 0 1px #F05A28';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>Mô tả</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Mô tả ngắn gọn..."
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #E2E8F0',
                                            background: '#ffffff',
                                            color: '#1E293B',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#F05A28';
                                            e.target.style.boxShadow = '0 0 0 1px #F05A28';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>Link Liên kết</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="/products hoặc https://example.com"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #E2E8F0',
                                            background: '#ffffff',
                                            color: '#1E293B',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#F05A28';
                                            e.target.style.boxShadow = '0 0 0 1px #F05A28';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#E2E8F0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>Vị trí</label>
                                        <select
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #E2E8F0',
                                                background: '#ffffff',
                                                color: '#1E293B',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#F05A28';
                                                e.target.style.boxShadow = '0 0 0 1px #F05A28';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#E2E8F0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        >
                                            <option value="hero">Hero Slider</option>
                                            <option value="flash_sale">Flash Sale</option>
                                            <option value="promo">Promo Banner</option>
                                            <option value="footer">Footer</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#1E293B', fontWeight: 600, fontSize: '0.95rem' }}>Thứ tự</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            min="0"
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #E2E8F0',
                                                background: '#ffffff',
                                                color: '#1E293B',
                                                fontSize: '0.95rem',
                                                outline: 'none'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#F05A28';
                                                e.target.style.boxShadow = '0 0 0 1px #F05A28';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#E2E8F0';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', border: '1px solid #E2E8F0', borderRadius: '8px', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#F05A28'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            style={{ width: '18px', height: '18px', accentColor: '#F05A28', cursor: 'pointer' }}
                                        />
                                        <span style={{ color: '#1E293B', fontWeight: 500 }}>Hiện thị banner này trên web</span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        style={{
                                            padding: '12px 24px',
                                            background: '#ffffff',
                                            color: '#64748B',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '9999px',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                                    >
                                        Hủy bỏ
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || !formData.imageUrl}
                                        style={{
                                            padding: '12px 32px',
                                            background: (uploading || !formData.imageUrl) ? '#94A3B8' : '#F05A28',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '9999px',
                                            cursor: (uploading || !formData.imageUrl) ? 'not-allowed' : 'pointer',
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
                                            boxShadow: '0 4px 6px -1px rgba(240, 90, 40, 0.2)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!uploading && formData.imageUrl) {
                                                e.currentTarget.style.transform = 'translateY(-1px)';
                                                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(240, 90, 40, 0.3)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!uploading && formData.imageUrl) {
                                                e.currentTarget.style.transform = 'none';
                                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(240, 90, 40, 0.2)';
                                            }
                                        }}
                                    >
                                        {editingBanner ? 'Lưu thay đổi' : 'Tạo Banner'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
