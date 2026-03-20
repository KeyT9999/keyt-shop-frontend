import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Product } from '../types/product';
import { CartContext } from './cart-context';
import type { CartItem } from './cart-context';
import { useAuthContext } from './useAuthContext';

const STORAGE_KEY_BASE = 'keyt-cart';

function loadCartFromStorage(storageKey: string): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ Lỗi khi đọc giỏ hàng từ localStorage', error);
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const activeStorageKey = useMemo(
    () => `${STORAGE_KEY_BASE}-${user?.id || (user as any)?._id || 'guest'}`,
    [user?.id, (user as any)?._id]
  );

  const [cart, setCart] = useState<CartItem[]>(() =>
    user ? loadCartFromStorage(activeStorageKey) : []
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(activeStorageKey, JSON.stringify(cart));
  }, [cart, activeStorageKey]);

  // Khi user thay đổi, tải giỏ hàng riêng; nếu không đăng nhập thì làm trống
  useEffect(() => {
    if (!user) {
      setCart([]);
      if (typeof window !== 'undefined') {
        localStorage.setItem(activeStorageKey, JSON.stringify([]));
      }
      return;
    }
    setCart(loadCartFromStorage(activeStorageKey));
  }, [activeStorageKey, user]);

  const addItem = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const upsertCartLine = (product: Product, quantity: number) => {
    const safeQuantity = Math.max(1, quantity);
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, ...product, quantity: safeQuantity }
            : item
        );
      }
      return [...prev, { ...product, quantity: safeQuantity }];
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item._id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const updateCartItem = (productId: string, productData: Partial<Product>) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, ...productData } : item
      )
    );
  };

  const updateCartItemOption = (productId: string, optionIndex: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id === productId && item.options && item.options[optionIndex]) {
          return {
            ...item,
            selectedOptionIndex: optionIndex,
            price: item.options[optionIndex].price
          };
        }
        return item;
      })
    );
  };

  const updateCartItemRequiredField = (productId: string, fieldLabel: string, value: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id === productId) {
          return {
            ...item,
            requiredFieldsData: {
              ...item.requiredFieldsData,
              [fieldLabel]: value
            }
          };
        }
        return item;
      })
    );
  };

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, totalItems, totalAmount, addItem, upsertCartLine, removeItem, updateQuantity, updateCartItem, updateCartItemOption, updateCartItemRequiredField, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

