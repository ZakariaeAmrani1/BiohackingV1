import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  InventoryFormData,
  InventoryMovement,
} from "@/services/inventoryService";
import { Product } from "@/services/productsService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => Promise<void>;
  isLoading?: boolean;
  products: Product[];
  movement?: InventoryMovement | null;
}

export default function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  products,
  movement,
}: Props) {
  const [id_bien, setIdBien] = useState<number>(0);
  const [quantite, setQuantite] = useState<number>(1);
  const [prix, setPrix] = useState<number>(0);

  useEffect(() => {
    if (movement) {
      setIdBien(movement.id_bien);
      setQuantite(movement.quantite);
      setPrix(movement.prix);
    } else {
      setIdBien(0);
      setQuantite(1);
      setPrix(0);
    }
  }, [movement, isOpen]);

  const canSubmit = id_bien > 0 && quantite > 0 && prix > 0;

  const title = movement ? "Modifier Mouvement IN" : "Nouveau Mouvement IN";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit({ id_bien, quantite, prix });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Produit</Label>
            <Select
              value={id_bien ? String(id_bien) : ""}
              onValueChange={(v) => setIdBien(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.Nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                min={1}
                value={quantite}
                onChange={(e) => setQuantite(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Prix Unitaire</Label>
              <Input
                type="number"
                min={0.01}
                step="0.01"
                value={prix}
                onChange={(e) => setPrix(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
            {movement ? "Enregistrer" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
