// Soin types
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
  SUIVI = "Suivi"
}

// Mock data storage
let mockSoins: Soin[] = [
  {
    id: 1,
    Nom: "Consultation générale",
    Type: SoinType.CONSULTATION,
    prix: 50.00,
    Cree_par: "Dr. Smith",
    created_at: "2024-01-01T10:30:00"
  },
  {
    id: 2,
    Nom: "Radiographie thoracique",
    Type: SoinType.DIAGNOSTIC,
    prix: 75.00,
    Cree_par: "Dr. Martin",
    created_at: "2024-01-02T14:20:00"
  },
  {
    id: 3,
    Nom: "Vaccination antigrippale",
    Type: SoinType.PREVENTIF,
    prix: 25.00,
    Cree_par: "Dr. Smith",
    created_at: "2024-01-03T09:15:00"
  },
  {
    id: 4,
    Nom: "Séance de kinésithérapie",
    Type: SoinType.REEDUCATION,
    prix: 40.00,
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-04T16:45:00"
  },
  {
    id: 5,
    Nom: "Chirurgie ambulatoire",
    Type: SoinType.CHIRURGIE,
    prix: 200.00,
    Cree_par: "Dr. Martin",
    created_at: "2024-01-05T11:30:00"
  },
  {
    id: 6,
    Nom: "Échographie abdominale",
    Type: SoinType.DIAGNOSTIC,
    prix: 80.00,
    Cree_par: "Dr. Smith",
    created_at: "2024-01-06T13:20:00"
  },
  {
    id: 7,
    Nom: "Consultation d'urgence",
    Type: SoinType.URGENCE,
    prix: 70.00,
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-07T08:10:00"
  },
  {
    id: 8,
    Nom: "Suivi post-opératoire",
    Type: SoinType.SUIVI,
    prix: 45.00,
    Cree_par: "Dr. Martin",
    created_at: "2024-01-08T15:40:00"
  },
  {
    id: 9,
    Nom: "Bilan sanguin complet",
    Type: SoinType.DIAGNOSTIC,
    prix: 35.00,
    Cree_par: "Dr. Smith",
    created_at: "2024-01-09T10:15:00"
  },
  {
    id: 10,
    Nom: "Thérapie manuelle",
    Type: SoinType.THERAPEUTIQUE,
    prix: 55.00,
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-10T14:30:00"
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class SoinsService {
  // Get all soins
  static async getAll(): Promise<Soin[]> {
    await delay(500);
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
    await delay(800);

    const newSoin: Soin = {
      id: Math.max(...mockSoins.map((soin) => soin.id)) + 1,
      ...data,
      created_at: new Date().toISOString(),
    };

    mockSoins.push(newSoin);
    return newSoin;
  }

  // Update existing soin
  static async update(
    id: number,
    data: SoinFormData,
  ): Promise<Soin | null> {
    await delay(800);

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
    await delay(500);

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
        soin.Cree_par.toLowerCase().includes(lowerQuery)
    );
  }

  // Get soins by type
  static async getByType(type: SoinType): Promise<Soin[]> {
    await delay(300);
    return mockSoins.filter(soin => soin.Type === type);
  }

  // Get price range statistics
  static async getPriceRange(): Promise<{ min: number; max: number; avg: number }> {
    await delay(200);
    const prices = mockSoins.map(soin => soin.prix);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
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
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

export const createEmptySoin = (): SoinFormData => {
  return {
    Nom: "",
    Type: SoinType.CONSULTATION,
    prix: 0,
    Cree_par: ""
  };
};

// Get statistics by type
export const getStatisticsByType = (soins: Soin[]) => {
  const statsByType: Record<string, { count: number; totalRevenue: number; avgPrice: number }> = {};

  Object.values(SoinType).forEach(type => {
    const soinsOfType = soins.filter(soin => soin.Type === type);
    const totalRevenue = soinsOfType.reduce((sum, soin) => sum + soin.prix, 0);
    
    statsByType[type] = {
      count: soinsOfType.length,
      totalRevenue,
      avgPrice: soinsOfType.length > 0 ? totalRevenue / soinsOfType.length : 0
    };
  });

  return statsByType;
};

// Calculate revenue statistics
export const getRevenueStatistics = (soins: Soin[]) => {
  const totalRevenue = soins.reduce((total, soin) => total + soin.prix, 0);
  const averagePrice = soins.length > 0 ? totalRevenue / soins.length : 0;
  const highestPrice = Math.max(...soins.map(soin => soin.prix));
  const lowestPrice = Math.min(...soins.map(soin => soin.prix));

  return {
    totalRevenue,
    averagePrice,
    highestPrice,
    lowestPrice,
    totalServices: soins.length
  };
};
