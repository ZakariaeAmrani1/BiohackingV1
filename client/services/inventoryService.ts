import api from "../api/axios";
import { CurrencyService } from "./currencyService";
import { ProductsService, Product } from "./productsService";
import { AuthService } from "./authService";

export type MovementType = "IN" | "OUT";

export interface InventoryMovementRaw {
  id: number;
  id_facture: number | null;
  id_bien: number;
  type_bien: string;
  quantite: number;
  Cree_par: string;
  prix: number;
  created_at: string;
  movementType: MovementType;
  bien?: { Nom: string };
}

export interface FactureRaw {
  id: number;
  CIN: string;
  date: string;
  prix_total: number;
  statut: string; // "Payée", etc.
  created_at: string;
}

export interface InventoryMovement {
  id: number;
  id_facture: number | null;
  id_bien: number;
  nom_bien: string;
  quantite: number;
  prix: number; // unit price
  total: number;
  movementType: MovementType;
  date: string; // OUT -> facture.date, IN -> created_at
  Cree_par: string;
  created_at: string;
}

export interface InventoryFormData {
  id_bien: number;
  quantite: number;
  prix: number;
}

export class InventoryService {
  static async getAll(): Promise<InventoryMovement[]> {
    const [factureRes, itemsRes] = await Promise.all([
      api.get<FactureRaw[]>(`facture`),
      api.get<InventoryMovementRaw[]>(`facture-bien`),
    ]);

    const facturesById = new Map<number, FactureRaw>();
    for (const f of factureRes.data) facturesById.set(f.id, f);

    const items = itemsRes.data.filter(
      (it) => (it.type_bien || "").toLowerCase() === "produit",
    );

    const result: InventoryMovement[] = [];
    for (const it of items) {
      const isOut =
        it.movementType === "OUT" ||
        (!!it.id_facture && it.movementType !== "IN");
      const linkedFacture = it.id_facture
        ? facturesById.get(it.id_facture)
        : undefined;

      // Only include OUT linked to a paid invoice
      if (isOut) {
        if (!linkedFacture) continue;
        if (linkedFacture.statut !== "Payée") continue;
      }

      const nom_bien = it.bien?.Nom ?? "";
      const date = isOut && linkedFacture ? linkedFacture.date : it.created_at;
      result.push({
        id: it.id,
        id_facture: it.id_facture ?? null,
        id_bien: it.id_bien,
        nom_bien,
        quantite: it.quantite,
        prix: it.prix,
        total: it.prix * it.quantite,
        movementType: isOut ? "OUT" : "IN",
        date,
        Cree_par: it.Cree_par,
        created_at: it.created_at,
      });
    }

    // Sort by date desc
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  static async createIN(data: InventoryFormData): Promise<InventoryMovement> {
    const current = AuthService.getCurrentUser();
    const res = await api.post(`facture-bien`, {
      id_bien: data.id_bien,
      type_bien: "produit",
      quantite: data.quantite,
      prix: data.prix,
      movementType: "IN",
      Cree_par: current?.CIN,
    });

    const product = await ProductsService.getById(data.id_bien);
    const nom_bien = product?.Nom || "";

    return {
      id: res.data.id,
      id_facture: null,
      id_bien: data.id_bien,
      nom_bien,
      quantite: data.quantite,
      prix: data.prix,
      total: data.prix * data.quantite,
      movementType: "IN",
      date: new Date().toISOString(),
      Cree_par: current?.CIN || "",
      created_at: new Date().toISOString(),
    };
  }

  static async updateIN(id: number, data: InventoryFormData): Promise<boolean> {
    await api.patch(`facture-bien/${id}`, {
      id_bien: data.id_bien,
      type_bien: "produit",
      quantite: data.quantite,
      prix: data.prix,
      movementType: "IN",
    });
    return true;
  }

  static async delete(id: number): Promise<boolean> {
    await api.delete(`facture-bien/IN/${id}`);
    return true;
  }
}

export const formatPrice = (price: number): string => {
  return CurrencyService.formatCurrency(price);
};
