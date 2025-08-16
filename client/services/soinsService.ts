import api from "../api/axios"; // Soin types
import { ActivitiesService } from "./activitiesService";
import { AuthService } from "./authService";
export interface Soin {
  id: number;
  Nom: string;
  Type: SoinType;
  prix: number;
  Cree_par: string;
  created_at: string;
}

export interface SoinFormData {
  Nom: string;
  Type: SoinType;
  prix: number;
  Cree_par: string;
}

// Enum for soin types
export enum SoinType {
  CONSULTATION = "Consultation",
  DIAGNOSTIC = "Diagnostic",
  PREVENTIF = "Préventif",
  THERAPEUTIQUE = "Thérapeutique",
  CHIRURGIE = "Chirurgie",
  REEDUCATION = "Rééducation",
  URGENCE = "Urgence",
  SUIVI = "Suivi",
}

// Mock data storage
let mockSoins: Soin[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class SoinsService {
  // Get all soins
  static async getAll(): Promise<Soin[]> {
    mockSoins = [];
    const result = await api.get(`bien?type=SERVICE`);
    const data = result.data;
    data.map((service) => {
      mockSoins.push({
        id: service.id,
        Nom: service.Nom,
        Type: service.Type,
        prix: service.prix,
        Cree_par: service.Cree_par,
        created_at: service.created_at,
      });
    });
    return [...mockSoins];
  }

  // Get soin by ID
  static async getById(id: number): Promise<Soin | null> {
    await delay(300);
    const soin = mockSoins.find((soin) => soin.id === id);
    return soin || null;
  }

  // Create new soin
  static async create(data: SoinFormData): Promise<Soin> {
    const currentUser = AuthService.getCurrentUser();
    const result = await api.post(`bien`, {
      Nom: data.Nom,
      bien_type: "SERVICE",
      Type: data.Type,
      prix: data.prix,
      stock: 1,
      Cree_par: currentUser.CIN,
    });

    const newSoin: Soin = {
      id: Math.max(...mockSoins.map((soin) => soin.id)) + 1,
      ...data,
      created_at: new Date().toISOString(),
    };

    mockSoins.push(newSoin);

    ActivitiesService.logActivity(
      "soin",
      "created",
      newSoin.id,
      newSoin.Nom,
      data.Cree_par,
    );

    window.dispatchEvent(new CustomEvent("activityLogged"));

    return newSoin;
  }

  // Update existing soin
  static async update(id: number, data: SoinFormData): Promise<Soin | null> {
    const currentUser = AuthService.getCurrentUser();
    const result = await api.patch(`bien/${id}`, {
      Nom: data.Nom,
      bien_type: "SERVICE",
      Type: data.Type,
      prix: data.prix,
      stock: 1,
      Cree_par: currentUser.CIN,
    });

    const index = mockSoins.findIndex((soin) => soin.id === id);
    if (index === -1) return null;

    const updatedSoin: Soin = {
      ...mockSoins[index],
      ...data,
    };

    mockSoins[index] = updatedSoin;
    return updatedSoin;
  }

  // Delete soin
  static async delete(id: number): Promise<boolean> {
    const result = await api.delete(`bien/${id}`);

    const index = mockSoins.findIndex((soin) => soin.id === id);
    if (index === -1) return false;

    mockSoins.splice(index, 1);
    return true;
  }

  // Search soins
  static async search(query: string): Promise<Soin[]> {
    await delay(300);

    const lowerQuery = query.toLowerCase();
    return mockSoins.filter(
      (soin) =>
        soin.Nom.toLowerCase().includes(lowerQuery) ||
        soin.Type.toLowerCase().includes(lowerQuery) ||
        soin.Cree_par.toLowerCase().includes(lowerQuery),
    );
  }

  // Get soins by type
  static async getByType(type: SoinType): Promise<Soin[]> {
    await delay(300);
    return mockSoins.filter((soin) => soin.Type === type);
  }

  // Get price range statistics
  static async getPriceRange(): Promise<{
    min: number;
    max: number;
    avg: number;
  }> {
    await delay(200);
    const prices = mockSoins.map((soin) => soin.prix);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    };
  }
}

// Validation functions
export const validateSoinData = (data: SoinFormData): string[] => {
  const errors: string[] = [];

  if (!data.Nom.trim()) {
    errors.push("Le nom du soin est obligatoire");
  }

  if (!data.Type) {
    errors.push("Le type de soin est obligatoire");
  }

  if (!data.prix || data.prix <= 0) {
    errors.push("Le prix doit être supérieur à 0");
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

export const getSoinTypes = (): SoinType[] => {
  return Object.values(SoinType);
};

export const getSoinTypeLabel = (type: SoinType): string => {
  return type;
};

export const getSoinTypeColor = (type: SoinType): string => {
  switch (type) {
    case SoinType.CONSULTATION:
      return "bg-blue-100 text-blue-800";
    case SoinType.DIAGNOSTIC:
      return "bg-purple-100 text-purple-800";
    case SoinType.PREVENTIF:
      return "bg-green-100 text-green-800";
    case SoinType.THERAPEUTIQUE:
      return "bg-orange-100 text-orange-800";
    case SoinType.CHIRURGIE:
      return "bg-red-100 text-red-800";
    case SoinType.REEDUCATION:
      return "bg-indigo-100 text-indigo-800";
    case SoinType.URGENCE:
      return "bg-yellow-100 text-yellow-800";
    case SoinType.SUIVI:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

export const createEmptySoin = (CIN?: string): SoinFormData => {
  return {
    Nom: "",
    Type: SoinType.CONSULTATION,
    prix: 0,
    Cree_par: CIN || "",
  };
};

// Get statistics by type
export const getStatisticsByType = (soins: Soin[]) => {
  const statsByType: Record<
    string,
    { count: number; totalRevenue: number; avgPrice: number }
  > = {};

  Object.values(SoinType).forEach((type) => {
    const soinsOfType = soins.filter((soin) => soin.Type === type);
    const totalRevenue = soinsOfType.reduce((sum, soin) => sum + soin.prix, 0);

    statsByType[type] = {
      count: soinsOfType.length,
      totalRevenue,
      avgPrice: soinsOfType.length > 0 ? totalRevenue / soinsOfType.length : 0,
    };
  });

  return statsByType;
};

// Calculate revenue statistics
export const getRevenueStatistics = (soins: Soin[]) => {
  const totalRevenue = soins.reduce((total, soin) => total + soin.prix, 0);
  const averagePrice = soins.length > 0 ? totalRevenue / soins.length : 0;
  const highestPrice = Math.max(...soins.map((soin) => soin.prix));
  const lowestPrice = Math.min(...soins.map((soin) => soin.prix));

  return {
    totalRevenue,
    averagePrice,
    highestPrice,
    lowestPrice,
    totalServices: soins.length,
  };
};
