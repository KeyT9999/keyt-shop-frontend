import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface AnimationItem {
  id: string;
  startX: number;
  startY: number;
  productImage?: string;
}

interface AddToCartAnimationContextType {
  triggerAnimation: (item: AnimationItem) => void;
  setCartIconRef: (ref: HTMLElement | null) => void;
}

const AddToCartAnimationContext = createContext<AddToCartAnimationContextType | undefined>(undefined);

export function AddToCartAnimationProvider({ children }: { children: ReactNode }) {
  const [animations, setAnimations] = useState<AnimationItem[]>([]);
  const [cartIconRef, setCartIconRef] = useState<HTMLElement | null>(null);

  const triggerAnimation = useCallback((item: AnimationItem) => {
    setAnimations((prev) => [...prev, item]);
    // Remove animation after it completes
    setTimeout(() => {
      setAnimations((prev) => prev.filter((a) => a.id !== item.id));
    }, 1000);
  }, []);

  return (
    <AddToCartAnimationContext.Provider value={{ triggerAnimation, setCartIconRef }}>
      {children}
      <AddToCartAnimationContainer animations={animations} cartIconRef={cartIconRef} />
    </AddToCartAnimationContext.Provider>
  );
}

function AddToCartAnimationContainer({
  animations,
  cartIconRef,
}: {
  animations: AnimationItem[];
  cartIconRef: HTMLElement | null;
}) {
  return (
    <>
      {animations.map((anim) => {
        const targetRect = cartIconRef?.getBoundingClientRect();
        const targetX = targetRect ? targetRect.left + targetRect.width / 2 : window.innerWidth - 100;
        const targetY = targetRect ? targetRect.top + targetRect.height / 2 : 80;

        return (
          <AddToCartAnimation
            key={anim.id}
            startX={anim.startX}
            startY={anim.startY}
            targetX={targetX}
            targetY={targetY}
            productImage={anim.productImage}
          />
        );
      })}
    </>
  );
}

function AddToCartAnimation({
  startX,
  startY,
  targetX,
  targetY,
  productImage,
}: {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  productImage?: string;
}) {
  // Calculate mid-point for arc effect
  const midX = (startX + targetX) / 2;
  const midY = Math.min(startY, targetY) - 80;

  return (
    <>
      <div
        className="add-to-cart-animation"
        style={{
          position: 'fixed',
          left: `${startX}px`,
          top: `${startY}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          pointerEvents: 'none',
          '--target-x': `${targetX}px`,
          '--target-y': `${targetY}px`,
          '--mid-x': `${midX}px`,
          '--mid-y': `${midY}px`,
          '--start-x': `${startX}px`,
          '--start-y': `${startY}px`,
        } as React.CSSProperties & { [key: string]: string }}
      >
        <div className="animation-item">
          {productImage ? (
            <img src={productImage} alt="Product" className="animation-image" />
          ) : (
            <div className="animation-icon">🛒</div>
          )}
        </div>
      </div>
      <style>{`
        .add-to-cart-animation {
          animation: flyToCart 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes flyToCart {
          0% {
            left: var(--start-x);
            top: var(--start-y);
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            left: var(--mid-x);
            top: var(--mid-y);
            transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
            opacity: 0.9;
          }
          100% {
            left: var(--target-x);
            top: var(--target-y);
            transform: translate(-50%, -50%) scale(0.2) rotate(360deg);
            opacity: 0;
          }
        }

        .animation-item {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: white;
          box-shadow: 0 8px 24px rgba(240, 90, 40, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 2px solid #F05A28;
        }

        .animation-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .animation-icon {
          font-size: 32px;
        }
      `}</style>
    </>
  );
}

export function useAddToCartAnimation() {
  const context = useContext(AddToCartAnimationContext);
  if (!context) {
    throw new Error('useAddToCartAnimation must be used within AddToCartAnimationProvider');
  }
  return context;
}
