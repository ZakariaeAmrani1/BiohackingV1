import { useState, useEffect } from "react";
import { CalendarDays, User, FileText, Clock, Stethoscope } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AppointmentFormData,
  RendezVous,
  validateAppointmentData,
  getAvailableDoctors,
  getAppointmentTypes,
} from "@/services/appointmentsService";

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AppointmentFormData) => Promise<void>;
  appointment?: RendezVous | null;
  isLoading?: boolean;
}

export default function AppointmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  appointment,
  isLoading = false,
}: AppointmentFormModalProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    CIN: "",
    patient_nom: "",
    sujet: "",
    date_rendez_vous: "",
    Cree_par: "",
    status: "programmé",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!appointment;
  const availableDoctors = getAvailableDoctors();
  const appointmentTypes = getAppointmentTypes();

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      // Convert ISO string to datetime-local format
      const dateTime = appointment.date_rendez_vous
        ? new Date(appointment.date_rendez_vous).toISOString().slice(0, 16)
        : "";

      setFormData({
        CIN: appointment.CIN || "",
        patient_nom: appointment.patient_nom || "",
        sujet: appointment.sujet || "",
        date_rendez_vous: dateTime,
        Cree_par: appointment.Cree_par || "",
        status: appointment.status || "programmé",
      });
    } else {
      // Reset form for new appointment
      setFormData({
        CIN: "",
        patient_nom: "",
        sujet: "",
        date_rendez_vous: "",
        Cree_par: "",
        status: "programmé",
      });
    }
    setErrors([]);
  }, [appointment, isOpen]);

  const handleInputChange = (field: keyof AppointmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validateAppointmentData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setErrors(["Une erreur s'est produite lors de l'enregistrement"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {isEditMode ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifiez les informations du rendez-vous"
              : "Créez un nouveau rendez-vous en remplissant les informations ci-dessous"}
          </DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Name */}
            <div className="space-y-2">
              <Label htmlFor="patient_nom" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom du patient
              </Label>
              <Input
                id="patient_nom"
                value={formData.patient_nom}
                onChange={(e) => handleInputChange("patient_nom", e.target.value)}
                placeholder="Nom complet du patient"
                disabled={isSubmitting}
              />
            </div>

            {/* CIN */}
            <div className="space-y-2">
              <Label htmlFor="CIN" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CIN
              </Label>
              <Input
                id="CIN"
                value={formData.CIN}
                onChange={(e) => handleInputChange("CIN", e.target.value.toUpperCase())}
                placeholder="BE123456"
                pattern="[A-Z]{2}\d{6}"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Format: 2 lettres suivies de 6 chiffres (ex: BE123456)
              </p>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="sujet" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Type de rendez-vous
            </Label>
            <Select
              value={formData.sujet}
              onValueChange={(value) => handleInputChange("sujet", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de rendez-vous" />
              </SelectTrigger>
              <SelectContent>
                {appointmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date and Time */}
            <div className="space-y-2">
              <Label htmlFor="date_rendez_vous" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Date et heure
              </Label>
              <Input
                id="date_rendez_vous"
                type="datetime-local"
                value={formData.date_rendez_vous}
                onChange={(e) => handleInputChange("date_rendez_vous", e.target.value)}
                disabled={isSubmitting}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Created By */}
            <div className="space-y-2">
              <Label htmlFor="Cree_par" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Créé par
              </Label>
              <Select
                value={formData.Cree_par}
                onValueChange={(value) => handleInputChange("Cree_par", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le médecin" />
                </SelectTrigger>
                <SelectContent>
                  {availableDoctors.map((doctor) => (
                    <SelectItem key={doctor} value={doctor}>
                      {doctor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status - only show in edit mode */}
          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value as AppointmentFormData["status"])}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programmé">Programmé</SelectItem>
                  <SelectItem value="confirmé">Confirmé</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                  <SelectItem value="annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? "Modification..." : "Création..."}
                </div>
              ) : (
                isEditMode ? "Modifier" : "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
