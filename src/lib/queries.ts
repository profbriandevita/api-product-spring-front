import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "./axiosInstance";
import { Category, Product } from "@/types/types";

// Obtener productos
export const useProducts = () =>
  useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Product[]>("/products");
      return data;
    },
  });

// Obtener categorías
export const useCategories = () =>
  useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Category[]>("/category/");
      return data;
    },
  });

// Crear producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, Omit<Product, "id" | "category"> & { categoryId: number }>({
    mutationFn: async (newProduct) => {
      const { data } = await axiosInstance.post<Product>("/products", {
        ...newProduct,
        category: { id: newProduct.categoryId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Refrescar productos
    },
  });
};

// Crear categoría
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, Omit<Category, "id">>({
    mutationFn: async (newCategory) => {
      const { data } = await axiosInstance.post<Category>("/category/", newCategory);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] }); // Refrescar categorías
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: number } & Omit<Product, "id" | "category"> & { categoryId: number }) => {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};