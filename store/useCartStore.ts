import { create } from 'zustand';

export type CartItem = {
  id: string;
  nombre: string;
  precio: number;
  unidad: string;
  cantidad: number;
  imagenUrl?: string;
};

type CartItemInput = Omit<CartItem, 'cantidad'> & {
  cantidad?: number;
};

type CartState = {
  items: CartItem[];
  agregarItem: (item: CartItemInput) => void;
  eliminarItem: (id: string) => void;
  actualizarCantidad: (id: string, cantidad: number) => void;
  limpiarCarrito: () => void;
};

function normalizarCantidad(cantidad: number) {
  return Math.max(1, Math.floor(cantidad));
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  agregarItem: (item) =>
    set((state) => {
      const cantidad = normalizarCantidad(item.cantidad ?? 1);
      const itemExistente = state.items.find((actual) => actual.id === item.id);

      if (itemExistente) {
        return {
          items: state.items.map((actual) =>
            actual.id === item.id
              ? { ...actual, cantidad: actual.cantidad + cantidad }
              : actual,
          ),
        };
      }

      return {
        items: [...state.items, { ...item, cantidad }],
      };
    }),

  eliminarItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  actualizarCantidad: (id, cantidad) =>
    set((state) => ({
      items:
        cantidad <= 0
          ? state.items.filter((item) => item.id !== id)
          : state.items.map((item) =>
              item.id === id
                ? { ...item, cantidad: normalizarCantidad(cantidad) }
                : item,
            ),
    })),

  limpiarCarrito: () => set({ items: [] }),
}));
