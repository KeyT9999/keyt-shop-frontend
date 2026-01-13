import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import type { Banner, BannerFormData } from '../../types/banner';
import { getAllBannersAdmin, createBanner, updateBanner, deleteBanner, uploadBannerImage } from '../../api/bannerApi';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import './AdminStyles.css';

export default function AdminBannerPage() {
    const { token } = useAuthContext();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="admin-page container">
            <div className="admin-header">
                <h2>Manage Banners</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingBanner(null);
                        resetForm();
                        setIsModalOpen(true);
                    }}
                >
                    <Plus size={18} /> Add Banner
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Position</th>
                                <th>Order</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.map((banner) => (
                                <tr key={banner._id}>
                                    <td>
                                        <img
                                            src={banner.imageUrl}
                                            alt={banner.title}
                                            style={{ height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    </td>
                                    <td>{banner.title || '-'}</td>
                                    <td>
                                        <span className={`badge badge-${banner.position}`}>{banner.position}</span>
                                    </td>
                                    <td>{banner.order}</td>
                                    <td>
                                        <span className={`status-badge ${banner.isActive ? 'active' : 'inactive'}`}>
                                            {banner.isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => openEditModal(banner)}>
                                                <Edit size={18} />
                                            </button>
                                            <button className="btn-icon delete" onClick={() => handleDelete(banner._id)}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Banner Image *</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                    {formData.imageUrl ? (
                                        <div style={{ position: 'relative', width: '150px', height: '100px' }}>
                                            <img
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                                style={{
                                                    position: 'absolute', top: -8, right: -8,
                                                    background: 'red', color: 'white',
                                                    border: 'none', borderRadius: '50%',
                                                    width: '24px', height: '24px', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                width: '150px', height: '100px',
                                                border: '2px dashed #ccc', borderRadius: '6px',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', background: '#f9fafb'
                                            }}
                                        >
                                            {uploading ? (
                                                <span style={{ fontSize: '0.8rem' }}>Uploading...</span>
                                            ) : (
                                                <>
                                                    <Upload size={24} color="#6b7280" />
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>Upload Image</span>
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
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="text"
                                            required
                                            value={formData.imageUrl}
                                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            placeholder="or paste image URL"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Link URL</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="/products/xyz"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Position</label>
                                    <select
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                                    >
                                        <option value="hero">Hero Slider</option>
                                        <option value="flash_sale">Flash Sale</option>
                                        <option value="promo">Promo Banner</option>
                                        <option value="footer">Footer</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="form-group checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    Active
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
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
