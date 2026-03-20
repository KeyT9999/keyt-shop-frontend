import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { Product, Category } from '../../types/product';
import ProductForm from '../../components/admin/ProductForm';
import { Plus, Search, Trash2, Edit, Tag, X, Flame, Image as ImageIcon, Settings, Filter } from 'lucide-react';

export default function ProductsPage() {
  const { token, user: currentUser } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (token && currentUser?.admin) {
      loadProducts();
      loadCategories();
    }
  }, [token, currentUser]);

  const loadProducts = async () => {
    try {
      const data = await adminService.getProducts(token!);
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await adminService.getCategories(token!);
      setCategories(data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    try {
      await adminService.createCategory({ name: newCategoryName.trim() }, token!);
      setNewCategoryName('');
      loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error occurred while adding category');
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) return;
    try {
      await adminService.deleteCategory(categoryId, token!);
      loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error occurred while deleting');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete product "${productName}"?`)) return;
    try {
      await adminService.deleteProduct(productId, token!);
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error occurred while deleting');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(false);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const handleSortOrderChange = async (productId: string, newSortOrder: number) => {
    if (!token) return;
    try {
      await adminService.updateProduct(productId, { sortOrder: newSortOrder }, token);
      loadProducts(); // Reload để cập nhật thứ tự
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật thứ tự');
    }
  };

  if (!currentUser?.admin) {
    return (
      <div className="p-8 text-center text-red-500">403 - Access Denied</div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory ? p.category === selectedCategory : true)
  );

  return (
    <div className="admin-page-content" style={{ paddingBottom: '40px', padding: '20px 16px' }}>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>

        {/* Header & Toolbar */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {/* Search & Filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-input"
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <Filter size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <select
                className="admin-input"
                style={{ paddingLeft: '36px', width: '100%' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn-admin btn-admin-outline"
              style={{ 
                background: 'white', 
                borderColor: '#F05A28', 
                color: '#F05A28',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              <Settings size={18} /> Manage Categories
            </button>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingProduct(null);
              }}
              className="btn-admin btn-admin-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {showAddForm ? 'Cancel' : <><Plus size={18} /> Add Product</>}
            </button>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        {(showAddForm || editingProduct) && (
          <div className="table-container" style={{ marginBottom: '24px', padding: '16px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#1E293B', fontSize: '1.1rem' }}>
              {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
            </h3>
            <ProductForm
              product={editingProduct || undefined}
              categories={categories}
              onClose={handleFormClose}
            />
          </div>
        )}

        {/* Data Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>Loading products...</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container" style={{ overflowX: 'auto', display: 'none' }} id="desktop-products-table">
              <table className="admin-table" style={{ minWidth: '800px', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'center' }}>Stock</th>
                  <th style={{ textAlign: 'center' }}>Thứ tự</th>
                  <th style={{ textAlign: 'center' }}>Hot</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94A3B8' }}>
                      <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                      <p>No products found matching "{searchQuery}"</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '8px',
                          background: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0',
                          margin: '0 auto'
                        }}>
                          {product.imageUrl || (product.images && product.images[0]) ? (
                            <img
                              src={product.imageUrl || (product.images && product.images[0]) || undefined}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <ImageIcon size={20} color="#94A3B8" />
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>{product.name}</div>
                          {product.isTiemBanhNetflix && (
                            <span className="status-badge" style={{ background: '#FEF3C7', color: '#B45309' }}>
                              Netflix
                            </span>
                          )}
                          {product.affiliateEnabled && (Number(product.affiliateCommissionPercent) || 0) > 0 && (
                            <span className="status-badge" style={{ background: '#DCFCE7', color: '#166534' }}>
                              HH {product.affiliateCommissionPercent}%
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{product.billingCycle}</div>
                      </td>
                      <td>
                        <span className="status-badge" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                          {product.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#F05A28', fontSize: '1rem' }}>
                          {product.price.toLocaleString('vi-VN')} {product.currency}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontWeight: 600,
                          color: product.stock > 0 ? '#1E293B' : '#EF4444',
                          background: product.stock > 0 ? '#F1F5F9' : '#FEF2F2',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          value={product.sortOrder ?? 999}
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            if (!isNaN(newValue) && newValue >= 0) {
                              handleSortOrderChange(product._id, newValue);
                            }
                          }}
                          min="0"
                          style={{
                            width: '70px',
                            padding: '6px 8px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#F05A28'}
                          onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                          title="Số càng nhỏ càng hiển thị trước"
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {product.isHot && <Flame size={20} color="#F05A28" fill="#F05A28" />}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn-admin btn-admin-ghost"
                            style={{ color: '#1E293B', padding: '6px' }}
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="btn-admin btn-admin-ghost"
                            style={{ color: '#EF4444', padding: '6px' }}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

            {/* Mobile Card View */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} id="mobile-products-cards">
              {filteredProducts.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#94A3B8', background: 'white', borderRadius: '12px' }}>
                  <Search size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <p>No products found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #F1F5F9',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Header with Image and Name */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        background: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                        flexShrink: 0
                      }}>
                        {product.imageUrl || (product.images && product.images[0]) ? (
                          <img
                            src={product.imageUrl || (product.images && product.images[0]) || undefined}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <ImageIcon size={24} color="#94A3B8" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem', wordBreak: 'break-word' }}>
                            {product.name}
                          </div>
                          {product.isTiemBanhNetflix && (
                            <span className="status-badge" style={{ background: '#FEF3C7', color: '#B45309', fontSize: '0.75rem' }}>
                              Netflix
                            </span>
                          )}
                          {product.affiliateEnabled && (Number(product.affiliateCommissionPercent) || 0) > 0 && (
                            <span className="status-badge" style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem' }}>
                              HH {product.affiliateCommissionPercent}%
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '8px' }}>
                          {product.billingCycle}
                        </div>
                        <span className="status-badge" style={{ background: '#E0F2FE', color: '#0369A1', fontSize: '0.8rem' }}>
                          {product.category}
                        </span>
                      </div>
                      {product.isHot && (
                        <div style={{ flexShrink: 0 }}>
                          <Flame size={24} color="#F05A28" fill="#F05A28" />
                        </div>
                      )}
                    </div>

                    {/* Price, Stock and Sort Order Row */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '12px',
                      padding: '12px 0',
                      borderTop: '1px solid #F1F5F9',
                      borderBottom: '1px solid #F1F5F9',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Price</div>
                        <span style={{ fontWeight: 700, color: '#F05A28', fontSize: '1rem' }}>
                          {product.price.toLocaleString('vi-VN')} {product.currency}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Stock</div>
                        <span style={{
                          fontWeight: 600,
                          color: product.stock > 0 ? '#1E293B' : '#EF4444',
                          background: product.stock > 0 ? '#F1F5F9' : '#FEF2F2',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.85rem'
                        }}>
                          {product.stock}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '4px' }}>Thứ tự</div>
                        <input
                          type="number"
                          value={product.sortOrder ?? 999}
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            if (!isNaN(newValue) && newValue >= 0) {
                              handleSortOrderChange(product._id, newValue);
                            }
                          }}
                          min="0"
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#F05A28'}
                          onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                          title="Số càng nhỏ càng hiển thị trước"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#1E293B',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        <Edit size={16} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: '#FEF2F2',
                          color: '#EF4444',
                          border: '1px solid #FECACA',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        <Trash2 size={16} /> Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* CSS for responsive */}
            <style>{`
              @media (min-width: 768px) {
                #desktop-products-table {
                  display: block !important;
                }
                #mobile-products-cards {
                  display: none !important;
                }
              }
              @media (max-width: 767px) {
                #desktop-products-table {
                  display: none !important;
                }
                #mobile-products-cards {
                  display: flex !important;
                }
              }
            `}</style>
          </>
        )}

        {/* Categories Modal */}
        {showCategoryModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '450px',
              maxHeight: '90vh',
              overflowY: 'auto',
              margin: '20px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={20} color="#F05A28" /> Manage Categories
                </h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="admin-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                  }}
                />
                <button
                  onClick={handleAddCategory}
                  className="btn-admin btn-admin-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={18} /> Add
                </button>
              </div>

              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '8px'
              }}>
                {categories.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8' }}>No categories created yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {categories.map(c => (
                      <div key={c._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #F1F5F9'
                      }}>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{c.name}</span>
                        <button
                          onClick={() => handleDeleteCategory(c._id, c.name)}
                          className="btn-admin btn-admin-danger"
                          style={{ padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
