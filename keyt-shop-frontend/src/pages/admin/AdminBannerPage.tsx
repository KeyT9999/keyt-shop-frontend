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

    const getPositionColor = (position: string) => {
        switch (position) {
            case 'hero': return 'blue';
            case 'flash_sale': return 'red';
            case 'promo': return 'purple';
            case 'footer': return 'gray';
            default: return 'gray';
        }
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
        <div className="banner-page">
            <div className="banner-header">
                <div className="banner-header-content">
                    <div>
                        <h1 className="banner-title">Banner Management</h1>
                        <p className="banner-subtitle">Manage your website banners and promotional content</p>
                    </div>
                    <button
                        className="btn-add-banner"
                        onClick={() => {
                            setEditingBanner(null);
                            resetForm();
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={20} />
                        <span>Add New Banner</span>
                    </button>
                </div>
            </div>

            <div className="banner-content">
                {loading ? (
                    <div className="banner-loading">
                        <div className="spinner"></div>
                        <p>Loading banners...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="banner-empty">
                        <ImageIcon size={64} strokeWidth={1} />
                        <h3>No banners yet</h3>
                        <p>Start by creating your first banner</p>
                        <button className="btn-add-banner" onClick={() => setIsModalOpen(true)}>
                            <Plus size={20} />
                            Add Banner
                        </button>
                    </div>
                ) : (
                    <div className="banner-grid">
                        {banners.map((banner) => (
                            <div key={banner._id} className="banner-card">
                                <div className="banner-card-image">
                                    <img src={banner.imageUrl} alt={banner.title || 'Banner'} />
                                    <div className="banner-card-overlay">
                                        <button 
                                            className="banner-action-btn edit"
                                            onClick={() => openEditModal(banner)}
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            className="banner-action-btn delete"
                                            onClick={() => handleDelete(banner._id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="banner-card-status">
                                        {banner.isActive ? (
                                            <span className="status-badge active">
                                                <Eye size={14} />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="status-badge inactive">
                                                <EyeOff size={14} />
                                                Hidden
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="banner-card-content">
                                    <div className="banner-card-header">
                                        <h3 className="banner-card-title">
                                            {banner.title || 'Untitled Banner'}
                                        </h3>
                                        <span className={`position-badge ${getPositionColor(banner.position)}`}>
                                            {getPositionLabel(banner.position)}
                                        </span>
                                    </div>
                                    {banner.description && (
                                        <p className="banner-card-description">{banner.description}</p>
                                    )}
                                    <div className="banner-card-footer">
                                        <div className="banner-card-meta">
                                            <span className="banner-order">Order: {banner.order}</span>
                                        </div>
                                        {banner.link && (
                                            <a 
                                                href={banner.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="banner-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink size={14} />
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
                <div className="modal-overlay-custom" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content-custom" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-custom">
                            <div>
                                <h2>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h2>
                                <p>Fill in the banner details below</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="banner-form">
                            <div className="form-section">
                                <label className="form-label">Banner Image *</label>
                                <div 
                                    className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${formData.imageUrl ? 'has-image' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    {formData.imageUrl ? (
                                        <div className="image-preview">
                                            <img src={formData.imageUrl} alt="Preview" />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            className="upload-placeholder"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="spinner-small"></div>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload size={40} />
                                                    <h4>Drop your image here, or click to browse</h4>
                                                    <p>Supports: JPG, PNG, GIF (Max 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <div className="form-divider">
                                    <span>OR</span>
                                </div>
                                <input
                                    type="url"
                                    className="form-input"
                                    required
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="Paste image URL here"
                                />
                            </div>

                            <div className="form-section">
                                <label className="form-label">Banner Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter banner title"
                                />
                            </div>

                            <div className="form-section">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter banner description"
                                    rows={3}
                                />
                            </div>

                            <div className="form-section">
                                <label className="form-label">Link URL</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="/products or https://example.com"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-section">
                                    <label className="form-label">Position</label>
                                    <select
                                        className="form-select"
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                                    >
                                        <option value="hero">Hero Slider</option>
                                        <option value="flash_sale">Flash Sale</option>
                                        <option value="promo">Promo Banner</option>
                                        <option value="footer">Footer</option>
                                    </select>
                                </div>

                                <div className="form-section">
                                    <label className="form-label">Display Order</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-section">
                                <label className="form-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span>Make this banner active</span>
                                </label>
                            </div>

                            <div className="modal-footer-custom">
                                <button 
                                    type="button" 
                                    className="btn-secondary-custom" 
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-primary-custom" 
                                    disabled={uploading || !formData.imageUrl}
                                >
                                    {editingBanner ? 'Save Changes' : 'Create Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
