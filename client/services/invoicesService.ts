// Invoice types
export interface Facture {
  id: number;
  CIN: string;
  date: string;
  prix_total: number;
  prix_ht: number; // Prix hors taxes
  tva_amount: number; // Montant TVA
  tva_rate: number; // Taux TVA (20%)
  statut: FactureStatut;
  notes: string;
  Cree_par: string;
  created_at: string;
}

export interface FactureBien {
  id: number;
  id_facture: number;
  id_bien: number;
  type_bien: TypeBien;
  quantite: number;
  Cree_par: string;
  prix_unitaire: number; // We'll store this for historical purposes
  nom_bien: string; // We'll store this for display purposes
}

export interface FactureFormData {
  CIN: string;
  date: string;
  statut: FactureStatut;
  notes: string;
  Cree_par: string;
  items: FactureItem[];
}

export interface FactureItem {
  id_bien: number;
  type_bien: TypeBien;
  quantite: number;
  prix_unitaire: number;
  nom_bien: string;
}

export interface FactureWithDetails extends Facture {
  items: FactureBien[];
  patient_name?: string;
}

// Enums
export enum FactureStatut {
  BROUILLON = "Brouillon",
  ENVOYEE = "Envoyée",
  PAYEE = "Payée",
  ANNULEE = "Annulée",
  EN_RETARD = "En retard",
}

export enum TypeBien {
  PRODUIT = "produit",
  SOIN = "soin",
}

// Mock data storage
let mockFactures: Facture[] = [
  {
    id: 1,
    CIN: "BE123456",
    date: "2024-01-15T10:30:00",
    prix_ht: 123.0,
    tva_amount: 24.6,
    tva_rate: 20,
    prix_total: 147.6,
    statut: FactureStatut.PAYEE,
    notes: "Consultation et médicaments prescrits",
    Cree_par: "Dr. Smith",
    created_at: "2024-01-15T10:30:00",
  },
  {
    id: 2,
    CIN: "BE234567",
    date: "2024-01-18T14:20:00",
    prix_ht: 75.0,
    tva_amount: 15.0,
    tva_rate: 20,
    prix_total: 90.0,
    statut: FactureStatut.ENVOYEE,
    notes: "Suivi vaccination",
    Cree_par: "Dr. Martin",
    created_at: "2024-01-18T14:20:00",
  },
  {
    id: 3,
    CIN: "BE123456",
    date: "2024-01-22T09:15:00",
    prix_ht: 200.0,
    tva_amount: 40.0,
    tva_rate: 20,
    prix_total: 240.0,
    statut: FactureStatut.BROUILLON,
    notes: "Consultation spécialisée avec examens",
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-22T09:15:00",
  },
  {
    id: 4,
    CIN: "BE345678",
    date: "2024-01-10T16:45:00",
    prix_ht: 45.0,
    tva_amount: 9.0,
    tva_rate: 20,
    prix_total: 54.0,
    statut: FactureStatut.EN_RETARD,
    notes: "Séance de kinésithérapie",
    Cree_par: "Dr. Smith",
    created_at: "2024-01-10T16:45:00",
  },
];

let mockFactureBiens: FactureBien[] = [
  {
    id: 1,
    id_facture: 1,
    id_bien: 1, // Paracétamol
    type_bien: TypeBien.PRODUIT,
    quantite: 2,
    Cree_par: "Dr. Smith",
    prix_unitaire: 2.5,
    nom_bien: "Paracétamol 500mg",
  },
  {
    id: 2,
    id_facture: 1,
    id_bien: 1, // Consultation générale
    type_bien: TypeBien.SOIN,
    quantite: 1,
    Cree_par: "Dr. Smith",
    prix_unitaire: 50.0,
    nom_bien: "Consultation générale",
  },
  {
    id: 3,
    id_facture: 1,
    id_bien: 2, // Radiographie
    type_bien: TypeBien.SOIN,
    quantite: 1,
    Cree_par: "Dr. Smith",
    prix_unitaire: 70.5,
    nom_bien: "Radiographie thoracique",
  },
  {
    id: 4,
    id_facture: 2,
    id_bien: 3, // Vaccination
    type_bien: TypeBien.SOIN,
    quantite: 1,
    Cree_par: "Dr. Martin",
    prix_unitaire: 25.0,
    nom_bien: "Vaccination antigrippale",
  },
  {
    id: 5,
    id_facture: 2,
    id_bien: 1, // Consultation
    type_bien: TypeBien.SOIN,
    quantite: 1,
    Cree_par: "Dr. Martin",
    prix_unitaire: 50.0,
    nom_bien: "Consultation générale",
  },
  {
    id: 6,
    id_facture: 3,
    id_bien: 5, // Chirurgie
    type_bien: TypeBien.SOIN,
    quantite: 1,
    Cree_par: "Dr. Dubois",
    prix_unitaire: 200.0,
    nom_bien: "Chirurgie ambulatoire",
  },
  {
    id: 7,
    id_facture: 4,
    id_bien: 4, // Kinésithérapie
    type_bien: TypeBien.SOIN,
    quantite: 1,
    Cree_par: "Dr. Smith",
    prix_unitaire: 45.0,
    nom_bien: "Séance de kinésithérapie",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class InvoicesService {
  // Get all invoices
  static async getAll(): Promise<Facture[]> {
    await delay(500);
    return [...mockFactures];
  }

  // Get all invoices with details
  static async getAllWithDetails(): Promise<FactureWithDetails[]> {
    await delay(500);
    return mockFactures.map((facture) => ({
      ...facture,
      items: mockFactureBiens.filter((item) => item.id_facture === facture.id),
    }));
  }

  // Get invoice by ID
  static async getById(id: number): Promise<FactureWithDetails | null> {
    await delay(300);
    const facture = mockFactures.find((facture) => facture.id === id);
    if (!facture) return null;

    const items = mockFactureBiens.filter((item) => item.id_facture === id);
    return {
      ...facture,
      items,
    };
  }

  // Get invoices by patient CIN
  static async getByPatientCIN(cin: string): Promise<Facture[]> {
    await delay(500);
    return mockFactures.filter((facture) => facture.CIN === cin);
  }

  // Create new invoice
  static async create(data: FactureFormData): Promise<FactureWithDetails> {
    await delay(800);

    // Calculate prices with TVA
    const prix_ht = data.items.reduce(
      (total, item) => total + item.prix_unitaire * item.quantite,
      0,
    );
    const tva_rate = 20;
    const tva_amount = parseFloat((prix_ht * (tva_rate / 100)).toFixed(2));
    const prix_total = parseFloat((prix_ht + tva_amount).toFixed(2));

    const newFacture: Facture = {
      id: Math.max(...mockFactures.map((facture) => facture.id)) + 1,
      CIN: data.CIN,
      date: data.date,
      prix_ht,
      tva_amount,
      tva_rate,
      prix_total,
      statut: data.statut,
      notes: data.notes,
      Cree_par: data.Cree_par,
      created_at: new Date().toISOString(),
    };

    mockFactures.push(newFacture);

    // Create facture items
    const newItems: FactureBien[] = data.items.map((item, index) => ({
      id: Math.max(...mockFactureBiens.map((item) => item.id)) + index + 1,
      id_facture: newFacture.id,
      id_bien: item.id_bien,
      type_bien: item.type_bien,
      quantite: item.quantite,
      Cree_par: data.Cree_par,
      prix_unitaire: item.prix_unitaire,
      nom_bien: item.nom_bien,
    }));

    mockFactureBiens.push(...newItems);

    return {
      ...newFacture,
      items: newItems,
    };
  }

  // Update existing invoice
  static async update(
    id: number,
    data: FactureFormData,
  ): Promise<FactureWithDetails | null> {
    await delay(800);

    const index = mockFactures.findIndex((facture) => facture.id === id);
    if (index === -1) return null;

    // Calculate prices with TVA
    const prix_ht = data.items.reduce(
      (total, item) => total + item.prix_unitaire * item.quantite,
      0,
    );
    const tva_rate = 20;
    const tva_amount = parseFloat((prix_ht * (tva_rate / 100)).toFixed(2));
    const prix_total = parseFloat((prix_ht + tva_amount).toFixed(2));

    const updatedFacture: Facture = {
      ...mockFactures[index],
      CIN: data.CIN,
      date: data.date,
      prix_ht,
      tva_amount,
      tva_rate,
      prix_total,
      statut: data.statut,
      notes: data.notes,
      Cree_par: data.Cree_par,
    };

    mockFactures[index] = updatedFacture;

    // Remove old items and add new ones
    mockFactureBiens = mockFactureBiens.filter(
      (item) => item.id_facture !== id,
    );

    const newItems: FactureBien[] = data.items.map((item, itemIndex) => ({
      id: Math.max(...mockFactureBiens.map((item) => item.id)) + itemIndex + 1,
      id_facture: id,
      id_bien: item.id_bien,
      type_bien: item.type_bien,
      quantite: item.quantite,
      Cree_par: data.Cree_par,
      prix_unitaire: item.prix_unitaire,
      nom_bien: item.nom_bien,
    }));

    mockFactureBiens.push(...newItems);

    return {
      ...updatedFacture,
      items: newItems,
    };
  }

  // Delete invoice
  static async delete(id: number): Promise<boolean> {
    await delay(500);

    const index = mockFactures.findIndex((facture) => facture.id === id);
    if (index === -1) return false;

    // Remove invoice and its items
    mockFactures.splice(index, 1);
    mockFactureBiens = mockFactureBiens.filter(
      (item) => item.id_facture !== id,
    );
    return true;
  }

  // Search invoices
  static async search(query: string): Promise<Facture[]> {
    await delay(300);

    const lowerQuery = query.toLowerCase();
    return mockFactures.filter(
      (facture) =>
        facture.CIN.toLowerCase().includes(lowerQuery) ||
        facture.Cree_par.toLowerCase().includes(lowerQuery) ||
        facture.notes.toLowerCase().includes(lowerQuery),
    );
  }

  // Update invoice status
  static async updateStatus(
    id: number,
    status: FactureStatut,
  ): Promise<Facture | null> {
    await delay(500);

    const index = mockFactures.findIndex((facture) => facture.id === id);
    if (index === -1) return null;

    mockFactures[index].statut = status;
    return mockFactures[index];
  }
}

// Validation functions
export const validateFactureData = (data: FactureFormData): string[] => {
  const errors: string[] = [];

  if (!data.CIN.trim()) {
    errors.push("Le CIN du patient est obligatoire");
  }

  if (!data.date) {
    errors.push("La date de la facture est obligatoire");
  }

  if (!data.Cree_par.trim()) {
    errors.push("Le créateur est obligatoire");
  }

  if (!data.items || data.items.length === 0) {
    errors.push("Au moins un article est requis");
  } else {
    data.items.forEach((item, index) => {
      if (!item.id_bien) {
        errors.push(
          `L'article ${index + 1} doit avoir un produit/service sélectionné`,
        );
      }
      if (item.quantite <= 0) {
        errors.push(
          `L'article ${index + 1} doit avoir une quantité supérieure à 0`,
        );
      }
      if (item.prix_unitaire <= 0) {
        errors.push(`L'article ${index + 1} doit avoir un prix supérieur à 0`);
      }
    });
  }

  return errors;
};

// Utility functions
export const getAvailableDoctors = (): string[] => {
  return ["Dr. Smith", "Dr. Martin", "Dr. Dubois", "Dr. Laurent"];
};

export const getFactureStatuses = (): FactureStatut[] => {
  return Object.values(FactureStatut);
};

export const getStatusColor = (status: FactureStatut): string => {
  switch (status) {
    case FactureStatut.BROUILLON:
      return "bg-gray-100 text-gray-800";
    case FactureStatut.ENVOYEE:
      return "bg-blue-100 text-blue-800";
    case FactureStatut.PAYEE:
      return "bg-green-100 text-green-800";
    case FactureStatut.ANNULEE:
      return "bg-red-100 text-red-800";
    case FactureStatut.EN_RETARD:
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const formatPrice = (price: number): string => {
  // Use dynamic import to avoid circular dependencies
  return import("./currencyService").then(module =>
    module.CurrencyService.formatCurrency(price)
  ) as any;
};

export const createEmptyFacture = (): FactureFormData => {
  return {
    CIN: "",
    date: new Date().toISOString().slice(0, 16), // Current date/time for datetime-local input
    statut: FactureStatut.BROUILLON,
    notes: "",
    Cree_par: "",
    items: [],
  };
};

export const createEmptyItem = (): FactureItem => {
  return {
    id_bien: 0,
    type_bien: TypeBien.PRODUIT,
    quantite: 1,
    prix_unitaire: 0,
    nom_bien: "",
  };
};

// Get invoice statistics
export const getInvoiceStatistics = (factures: Facture[]) => {
  const totalInvoices = factures.length;
  const totalRevenue = factures.reduce(
    (sum, facture) => sum + facture.prix_total,
    0,
  );
  const paidInvoices = factures.filter(
    (f) => f.statut === FactureStatut.PAYEE,
  ).length;
  const pendingInvoices = factures.filter(
    (f) => f.statut === FactureStatut.ENVOYEE,
  ).length;
  const overdueInvoices = factures.filter(
    (f) => f.statut === FactureStatut.EN_RETARD,
  ).length;
  const draftInvoices = factures.filter(
    (f) => f.statut === FactureStatut.BROUILLON,
  ).length;

  return {
    totalInvoices,
    totalRevenue,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    draftInvoices,
    averageInvoiceValue: totalInvoices > 0 ? totalRevenue / totalInvoices : 0,
  };
};

// Calculate invoice total
export const calculateInvoiceTotal = (items: FactureItem[]): number => {
  return items.reduce(
    (total, item) => total + item.prix_unitaire * item.quantite,
    0,
  );
};

// Calculate invoice totals with TVA
export const calculateInvoiceTotals = (
  items: FactureItem[],
): {
  prix_ht: number;
  tva_amount: number;
  tva_rate: number;
  prix_total: number;
} => {
  const prix_ht = items.reduce(
    (total, item) => total + item.prix_unitaire * item.quantite,
    0,
  );
  const tva_rate = 20;
  const tva_amount = parseFloat((prix_ht * (tva_rate / 100)).toFixed(2));
  const prix_total = parseFloat((prix_ht + tva_amount).toFixed(2));

  return {
    prix_ht,
    tva_amount,
    tva_rate,
    prix_total,
  };
};
