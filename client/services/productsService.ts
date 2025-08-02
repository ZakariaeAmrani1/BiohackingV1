import { CurrencyService } from "./currencyService";

// Product types
export interface Product {
  id: number;
  Nom: string;
  prix: number;
  stock: number;
  Cree_par: string;
  created_at: string;
}

export interface ProductFormData {
  Nom: string;
  prix: number;
  stock: number;
  Cree_par: string;
}

import { ActivitiesService } from "./activitiesService";

// Mock data storage
let mockProducts: Product[] = [
  {
    id: 1,
    Nom: "Paracétamol 500mg",
    prix: 2.5,
    stock: 150,
    Cree_par: "Dr. Smith",
    created_at: "2024-01-01T10:30:00",
  },
  {
    id: 2,
    Nom: "Bandages élastiques",
    prix: 8.9,
    stock: 45,
    Cree_par: "Dr. Martin",
    created_at: "2024-01-02T14:20:00",
  },
  {
    id: 3,
    Nom: "Seringues jetables (boîte de 100)",
    prix: 15.75,
    stock: 25,
    Cree_par: "Dr. Smith",
    created_at: "2024-01-03T09:15:00",
  },
  {
    id: 4,
    Nom: "Thermomètre digital",
    prix: 12.3,
    stock: 8,
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-04T16:45:00",
  },
  {
    id: 5,
    Nom: "Gants latex (boîte de 100)",
    prix: 18.5,
    stock: 35,
    Cree_par: "Dr. Martin",
    created_at: "2024-01-05T11:30:00",
  },
  {
    id: 6,
    Nom: "Compresses stériles",
    prix: 6.2,
    stock: 75,
    Cree_par: "Dr. Smith",
    created_at: "2024-01-06T13:20:00",
  },
  {
    id: 7,
    Nom: "Désinfectant 500ml",
    prix: 4.8,
    stock: 22,
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-07T08:10:00",
  },
  {
    id: 8,
    Nom: "Masques chirurgicaux (boîte de 50)",
    prix: 12.9,
    stock: 65,
    Cree_par: "Dr. Martin",
    created_at: "2024-01-08T15:40:00",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ProductsService {
  // Get all products
  static async getAll(): Promise<Product[]> {
    await delay(500);
    return [...mockProducts];
  }

  // Get product by ID
  static async getById(id: number): Promise<Product | null> {
    await delay(300);
    const product = mockProducts.find((product) => product.id === id);
    return product || null;
  }

  // Create new product
  static async create(data: ProductFormData): Promise<Product> {
    await delay(800);

    const newProduct: Product = {
      id: Math.max(...mockProducts.map((product) => product.id)) + 1,
      ...data,
      created_at: new Date().toISOString(),
    };

    mockProducts.push(newProduct);

    // Log activity
    ActivitiesService.logActivity(
      "product",
      "created",
      newProduct.id,
      newProduct.Nom,
      data.Cree_par,
    );

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("activityLogged"));

    return newProduct;
  }

  // Update existing product
  static async update(
    id: number,
    data: ProductFormData,
  ): Promise<Product | null> {
    await delay(800);

    const index = mockProducts.findIndex((product) => product.id === id);
    if (index === -1) return null;

    const updatedProduct: Product = {
      ...mockProducts[index],
      ...data,
    };

    mockProducts[index] = updatedProduct;
    return updatedProduct;
  }

  // Delete product
  static async delete(id: number): Promise<boolean> {
    await delay(500);

    const index = mockProducts.findIndex((product) => product.id === id);
    if (index === -1) return false;

    mockProducts.splice(index, 1);
    return true;
  }

  // Search products
  static async search(query: string): Promise<Product[]> {
    await delay(300);

    const lowerQuery = query.toLowerCase();
    return mockProducts.filter(
      (product) =>
        product.Nom.toLowerCase().includes(lowerQuery) ||
        product.Cree_par.toLowerCase().includes(lowerQuery),
    );
  }

  // Get low stock products (stock <= threshold)
  static async getLowStock(threshold: number = 10): Promise<Product[]> {
    await delay(300);
    return mockProducts.filter((product) => product.stock <= threshold);
  }

  // Update stock
  static async updateStock(
    id: number,
    newStock: number,
  ): Promise<Product | null> {
    await delay(500);

    const index = mockProducts.findIndex((product) => product.id === id);
    if (index === -1) return null;

    mockProducts[index].stock = newStock;
    return mockProducts[index];
  }
}

// Validation functions
export const validateProductData = (data: ProductFormData): string[] => {
  const errors: string[] = [];

  if (!data.Nom.trim()) {
    errors.push("Le nom du produit est obligatoire");
  }

  if (!data.prix || data.prix <= 0) {
    errors.push("Le prix doit être supérieur à 0");
  }

  if (data.stock < 0) {
    errors.push("Le stock ne peut pas être négatif");
  }

  if (!data.Cree_par.trim()) {
    errors.push("Le créateur est obligatoire");
  }

  return errors;
};

// Utility functions
export const getAvailableDoctors = (): string[] => {
  return ["Dr. Smith", "Dr. Martin", "Dr. Dubois", "Dr. Laurent"];
};

export const formatPrice = (price: number): string => {
  return CurrencyService.formatCurrency(price);
};

export const getStockStatus = (
  stock: number,
): {
  status: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} => {
  if (stock === 0) {
    return { status: "Rupture", variant: "destructive" };
  } else if (stock <= 10) {
    return { status: "Stock faible", variant: "outline" };
  } else {
    return { status: "En stock", variant: "secondary" };
  }
};

export const createEmptyProduct = (): ProductFormData => {
  return {
    Nom: "",
    prix: 0,
    stock: 0,
    Cree_par: "",
  };
};

// Calculate total inventory value
export const calculateTotalValue = (products: Product[]): number => {
  return products.reduce(
    (total, product) => total + product.prix * product.stock,
    0,
  );
};

// Get stock statistics
export const getStockStatistics = (products: Product[]) => {
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const inStock = products.filter((p) => p.stock > 10).length;
  const totalValue = calculateTotalValue(products);

  return {
    totalProducts,
    outOfStock,
    lowStock,
    inStock,
    totalValue,
  };
};
