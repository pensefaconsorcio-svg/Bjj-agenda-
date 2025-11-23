import React from 'react';
import Modal from './Modal';
import { TrashIcon } from './icons/TrashIcon';
import { ShoppingCartIcon } from './icons/ShoppingCartIcon';
import { useAppStore } from '../store';

const CartModal: React.FC = () => {
  const { 
    isCartOpen, 
    cartItems, 
    closeCart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    openCheckout 
  } = useAppStore(state => ({
    isCartOpen: state.isCartOpen,
    cartItems: state.cart,
    closeCart: state.closeCart,
    updateCartQuantity: state.updateCartQuantity,
    removeFromCart: state.removeFromCart,
    clearCart: state.clearCart,
    openCheckout: state.openCheckout,
  }));

  if (!isCartOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={closeCart}>
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg m-4 flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ height: 'min(80vh, 700px)' }}
      >
        <div className="flex justify-between items-center border-b border-gray-700 p-4 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center">
            <ShoppingCartIcon />
            <span className="ml-2">Seu Carrinho</span>
          </h2>
          <button onClick={closeCart} className="text-gray-400 hover:text-gray-200 text-3xl">&times;</button>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <ShoppingCartIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-200">Seu carrinho está vazio</h3>
            <p className="text-gray-400 mt-2">Adicione produtos da loja para vê-los aqui.</p>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4 bg-gray-900/50 p-3 rounded-lg">
                  <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0"/>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-100">{item.name}</p>
                    <p className="text-sm text-red-500 font-bold">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="h-7 w-7 rounded-md bg-gray-700 hover:bg-gray-600">-</button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="h-7 w-7 rounded-md bg-gray-700 hover:bg-gray-600">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-700 p-4 flex-shrink-0 bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-300">Total:</span>
                    <span className="text-2xl font-bold text-red-500">R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button onClick={clearCart} className="w-full sm:w-auto px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500 transition-colors text-sm">
                        Limpar Carrinho
                    </button>
                    <button onClick={openCheckout} className="flex-grow px-4 py-2 rounded-md text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors">
                        Finalizar Compra via Pix
                    </button>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartModal;
