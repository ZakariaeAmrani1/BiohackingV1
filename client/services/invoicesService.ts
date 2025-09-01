import { CurrencyService } from "./currencyService";
import api from "../api/axios";
import { AuthService } from "./authService";

// Invoice types
export interface Facture {
  id: number;
  CIN: string;
  date: string;
  prix_total: number;
  prix_ht: number;
  tva_amount: number;
  tva_rate: number;
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
  prix_unitaire: number;
  nom_bien: string;
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
let mockFactures: Facture[] = [];

let mockFactureBiens: FactureBien[] = [];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class InvoicesService {
  static async getAll(): Promise<Facture[]> {
    mockFactures = [];
    mockFactureBiens = [];
    const result = await api.get(`facture`);
    const data = result.data;
    data.map((facture) => {
      mockFactures.push({
        id: facture.id,
        CIN: facture.CIN,
        date: facture.date,
        prix_ht: facture.date,
        tva_amount: facture.date,
        tva_rate: 20,
        prix_total: facture.prix_total,
        statut:
          facture.statut === "Brouillon"
            ? FactureStatut.BROUILLON
            : facture.statut === "Envoyée"
              ? FactureStatut.ENVOYEE
              : facture.statut === "Payée"
                ? FactureStatut.PAYEE
                : facture.statut === "Annulée"
                  ? FactureStatut.ANNULEE
                  : FactureStatut.EN_RETARD,
        notes: facture.notes,
        Cree_par: facture.Cree_par,
        created_at: facture.created_at,
      });
    });

    const result1 = await api.get(`facture-bien`);
    const data1 = result1.data;
    data1.map((facture) => {
      mockFactureBiens.push({
        id: facture.id,
        id_facture: facture.id_facture,
        id_bien: facture.id_bien,
        type_bien: facture.type_bien,
        quantite: facture.quantite,
        Cree_par: facture.Cree_par,
        nom_bien: facture.bien.Nom,
        prix_unitaire: facture.bien.prix,
      });
    });
    return [...mockFactures];
  }

  static async getAllWithDetails(): Promise<FactureWithDetails[]> {
    return mockFactures.map((facture) => ({
      ...facture,
      items: mockFactureBiens.filter((item) => item.id_facture === facture.id),
    }));
  }

  static async getById(id: number): Promise<FactureWithDetails | null> {
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
    return mockFactures.filter((facture) => facture.CIN === cin);
  }

  // Create new invoice
  static async create(data: FactureFormData): Promise<FactureWithDetails> {
    const prix_ht = data.items.reduce(
      (total, item) => total + item.prix_unitaire * item.quantite,
      0,
    );
    const tva_rate = 20;
    const tva_amount = parseFloat((prix_ht * (tva_rate / 100)).toFixed(2));
    const prix_total = parseFloat((prix_ht + tva_amount).toFixed(2));
    const currentUser = AuthService.getCurrentUser();
    const result = await api.post(`facture`, {
      CIN: data.CIN,
      date: data.date,
      prix_total: prix_total,
      statut: data.statut,
      notes: data.notes,
      Cree_par: currentUser.CIN,
    });
    const facture_id = result.data.id;
    const newFacture: Facture = {
      id: facture_id,
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
    const newItems: FactureBien[] = [];
    data.items.map(async (item) => {
      const res = await api.post(`facture-bien`, {
        id_facture: facture_id,
        id_bien: item.id_bien,
        type_bien: item.type_bien,
        quantite: item.quantite,
        Cree_par: currentUser.CIN,
      });

      newItems.push({
        id: res.data.id,
        id_facture: newFacture.id,
        id_bien: item.id_bien,
        type_bien: item.type_bien,
        quantite: item.quantite,
        Cree_par: data.Cree_par,
        prix_unitaire: item.prix_unitaire,
        nom_bien: item.nom_bien,
      });
    });

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
    const index = mockFactures.findIndex((facture) => facture.id === id);
    if (index === -1) return null;

    const prix_ht = data.items.reduce(
      (total, item) => total + item.prix_unitaire * item.quantite,
      0,
    );
    const tva_rate = 20;
    const tva_amount = parseFloat((prix_ht * (tva_rate / 100)).toFixed(2));
    const prix_total = parseFloat((prix_ht + tva_amount).toFixed(2));

    const currentUser = AuthService.getCurrentUser();
    const result = await api.patch(`facture/${id}`, {
      CIN: data.CIN,
      date: data.date,
      prix_total: prix_total,
      statut: data.statut,
      notes: data.notes,
      Cree_par: currentUser.CIN,
    });

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

    await api.delete(`facture-bien/${id}`);

    mockFactureBiens = mockFactureBiens.filter(
      (item) => item.id_facture !== id,
    );

    const newItems: FactureBien[] = [];
    data.items.map(async (item) => {
      const res = await api.post(`facture-bien`, {
        id_facture: id,
        id_bien: item.id_bien,
        type_bien: item.type_bien,
        quantite: item.quantite,
        Cree_par: currentUser.CIN,
      });

      newItems.push({
        id: res.data.id,
        id_facture: id,
        id_bien: item.id_bien,
        type_bien: item.type_bien,
        quantite: item.quantite,
        Cree_par: data.Cree_par,
        prix_unitaire: item.prix_unitaire,
        nom_bien: item.nom_bien,
      });
    });

    mockFactureBiens.push(...newItems);

    return {
      ...updatedFacture,
      items: newItems,
    };
  }

  // Delete invoice
  static async delete(id: number): Promise<boolean> {
    const index = mockFactures.findIndex((facture) => facture.id === id);
    if (index === -1) return false;

    await api.delete(`facture-bien/${id}`);
    await api.delete(`facture/${id}`);

    mockFactures.splice(index, 1);
    mockFactureBiens = mockFactureBiens.filter(
      (item) => item.id_facture !== id,
    );
    return true;
  }

  // Search invoices
  static async search(query: string): Promise<Facture[]> {
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
    const index = mockFactures.findIndex((facture) => facture.id === id);
    if (index === -1) return null;
    await api.patch(`facture/${id}`, {
      statut: status,
    });
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
  return CurrencyService.formatCurrency(price);
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
