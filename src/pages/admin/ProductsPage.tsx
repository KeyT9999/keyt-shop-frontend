import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/useAuthContext';
import { adminService } from '../../services/adminService';
import type { Product } from '../../types/product';
import ProductForm from '../../components/admin/ProductForm';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

export default function ProductsPage() {
  const { token, user: currentUser } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
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
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    try {
      await adminService.createCategory({ name: newCategoryName.trim() }, token!);
      setNewCategoryName('');
      setShowCategoryForm(false);
      loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi thêm danh mục');
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${categoryName}"?`)) return;
    try {
      await adminService.deleteCategory(categoryId, token!);
      loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${productName}"?`)) return;
    try {
      await adminService.deleteProduct(productId, token!);
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa');
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

  if (!currentUser?.admin) {
    return (
      <div className="main-content">
        <div style={{ padding: '2rem', color: '#1f2937' }}>403 - Không có quyền</div>
      </div>
    );
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="main-content">
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#1f2937', margin: 0 }}>Quản lý Sản phẩm</h1>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingProduct(null);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {showAddForm ? 'Hủy' : '+ Thêm Sản phẩm'}
          </button>
        </div>

        {showAddForm && !editingProduct && (
          <div style={{ marginBottom: '2rem', background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
            <ProductForm categories={categories} onClose={handleFormClose} />
          </div>
        )}

        {editingProduct && (
          <div style={{ marginBottom: '2rem', background: '#ffffff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
            <ProductForm product={editingProduct} categories={categories} onClose={handleFormClose} />
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#1f2937' }}>Đang tải...</div>
        ) : (
          <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e5e5' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Tên</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Danh mục</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Giá</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Tồn kho</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1f2937', fontWeight: '600' }}>Hot</th>
                  <th style={{ padding: '1rem', textAlign: 'right', color: '#1f2937', fontWeight: '600' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      {searchQuery ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                      <td style={{ padding: '1rem', color: '#1f2937' }}>{product.name}</td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>{product.category}</td>
                      <td style={{ padding: '1rem', color: '#1f2937' }}>
                        {product.price.toLocaleString('vi-VN')} {product.currency}/{product.billingCycle}
                      </td>
                      <td style={{ padding: '1rem', color: '#1f2937' }}>{product.stock}</td>
                      <td style={{ padding: '1rem', color: '#1f2937' }}>{product.isHot ? '🔥' : '-'}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            padding: '0.5rem 1rem',
                            marginRight: '0.5rem',
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Category Management - Bottom Right */}
        <div style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          right: '2rem', 
          background: '#ffffff', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #e5e5e5',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          minWidth: '300px',
          maxWidth: '400px',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Danh Mục</h3>
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              style={{
                padding: '0.5rem 1rem',
                background: '#22c55e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              {showCategoryForm ? 'Hủy' : '+ Thêm'}
            </button>
          </div>

          {showCategoryForm && (
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e5e5' }}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem'
                }}
              />
              <button
                onClick={handleAddCategory}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                Thêm Danh Mục
              </button>
            </div>
          )}

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {categories.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0' }}>
                Chưa có danh mục nào
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {categories.map((category) => (
                  <div
                    key={category._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      borderRadius: '6px',
                      border: '1px solid #e5e5e5'
                    }}
                  >
                    <span style={{ color: '#1f2937', fontSize: '0.9rem', fontWeight: '500' }}>
                      {category.name}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(category._id, category.name)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

