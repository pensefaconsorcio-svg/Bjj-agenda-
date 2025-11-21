import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { type Product } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StoreIcon } from './icons/StoreIcon';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ShoppingCartPlusIcon } from './icons/ShoppingCartPlusIcon';
import { useAppStore } from '../store';

const initialFormState: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  imageUrl: '',
  category: '',
};

const StoreView: React.FC = () => {
  const { user, products, addProduct, updateProduct, deleteProduct, addToCart } = useAppStore(state => ({
    user: state.currentUser!,
    products: state.products,
    addProduct: state.addProduct,
    updateProduct: state.updateProduct,
    deleteProduct: state.deleteProduct,
    addToCart: state.addToCart,
  }));

  // Admin states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAdminOrMestre = user.role === 'admin' || user.role === 'mestre';

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
    } else {
      setFormData(initialFormState);
    }
  }, [editingProduct]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error("Por favor, adicione uma imagem para o produto.");
      return;
    }
    setIsSaving(true);
    try {
        if (editingProduct) {
          await updateProduct({ ...formData, id: editingProduct.id });
        } else {
          await addProduct(formData);
        }
        handleCloseFormModal();
    } catch (error) {
        toast.error("Ocorreu um erro ao salvar o produto.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id!);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="flex justify-end mb-6">
          {isAdminOrMestre && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
            >
              <PlusCircleIcon />
              <span>Adicionar Produto</span>
            </button>
          )}
        </div>
        
        {products.length === 0 && isAdminOrMestre ? (
             <EmptyState 
                icon={<StoreIcon />}
                title="Sua loja está vazia"
                message="Nenhum produto foi cadastrado ainda. Adicione o primeiro item para começar a vender para seus alunos."
                actionButton={
                <button 
                    onClick={handleOpenAddModal} 
                    className="flex items-center mx-auto space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
                >
                    <PlusCircleIcon />
                    <span>Adicionar primeiro produto</span>
                </button>
                }
            />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
                <div key={product.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-sm group flex flex-col transition-all duration-300 hover:shadow-lg hover:border-gray-600 hover:-translate-y-1">
                <div className="relative">
                    <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-gray-100 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-400">{product.category}</p>
                    <div className="flex-grow"></div>
                    <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-bold text-red-500">R$ {product.price.toFixed(2)}</span>
                    {isAdminOrMestre ? (
                        <div className="flex items-center space-x-2">
                        <button onClick={() => handleOpenEditModal(product)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-700 rounded-full transition-colors"><EditIcon /></button>
                        <button onClick={() => setProductToDelete(product)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-700 rounded-full transition-colors"><TrashIcon /></button>
                        </div>
                    ) : (
                        <button 
                        onClick={() => addToCart(product)} 
                        className="flex items-center justify-center space-x-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md transition-all shadow-sm"
                        aria-label={`Adicionar ${product.name} ao carrinho`}
                        >
                        <ShoppingCartPlusIcon />
                        <span>Adicionar</span>
                        </button>
                    )}
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal for Admins */}
      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Confirmar Exclusão">
        {productToDelete && (
          <div>
            <p className="text-gray-300">Tem certeza que deseja excluir o produto abaixo?</p>
            <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700 flex items-center space-x-4">
                <img src={productToDelete.imageUrl} alt={productToDelete.name} className="w-16 h-16 object-cover rounded-md" />
                <div>
                    <p className="font-semibold text-gray-100">{productToDelete.name}</p>
                    <p className="text-gray-400 text-sm mt-1">R$ {productToDelete.price.toFixed(2)}</p>
                </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
                <button onClick={() => setProductToDelete(null)} className="px-4 py-2 rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors">Cancelar</button>
                <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-md text-white bg-red-800 hover:bg-red-700 transition-colors">Excluir Produto</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal for Admins */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Produto</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
            <input type="text" id="category" name="category" value={formData.category} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-1">Preço</label>
            <input type="number" id="price" name="price" value={formData.price} onChange={handleFormChange} required min="0" step="0.01" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
           <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-300 mb-1">Imagem do Produto</label>
            {formData.imageUrl && (
              <div className="my-2">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-md border border-gray-600" />
              </div>
            )}
            <input 
              type="file" 
              id="imageFile" 
              name="imageFile"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-red-700 cursor-pointer"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-4 pt-4">
              <button type="button" onClick={handleCloseFormModal} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="flex items-center justify-center w-28 px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-red-800">
                {isSaving ? <SpinnerIcon /> : 'Salvar'}
              </button>
            </div>
        </form>
      </Modal>
    </>
  );
};

export default StoreView;