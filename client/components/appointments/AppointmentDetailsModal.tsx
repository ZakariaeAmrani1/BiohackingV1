import {
  CalendarDays,
  User,
  FileText,
  Clock,
  Stethoscope,
  UserCheck,
  Calendar,
  Edit,
  Trash2,
  CheckCircle,
  PlayCircle,
  XCircle,
  CircleDot,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RendezVous, AppointmentsService } from "@/services/appointmentsService";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: RendezVous | null;
  onEdit?: (appointment: RendezVous) => void;
  onDelete?: (appointment: RendezVous) => void;
  onStatusUpdate?: () => void;
}

const statusColors = {
  programmé: "bg-blue-100 text-blue-700 border-blue-200",
  confirmé: "bg-green-100 text-green-700 border-green-200",
  terminé: "bg-gray-100 text-gray-700 border-gray-200",
  annulé: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
  programmé: "Programmé",
  confirmé: "Confirmé",
  terminé: "Terminé",
  annulé: "Annulé",
};

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
  onStatusUpdate,
}: AppointmentDetailsModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { toast } = useToast();

  if (!appointment) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment);
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(appointment);
    }
    onClose();
  };

  const handleStatusUpdate = async (newStatus: "programmé" | "confirmé" | "terminé" | "annulé") => {
    if (!appointment) return;

    try {
      setIsUpdatingStatus(true);

      // Create updated appointment data
      const updateData = {
        client_id: appointment.client_id!,
        sujet: appointment.sujet,
        date_rendez_vous: appointment.date_rendez_vous,
        Cree_par: appointment.Cree_par,
        status: newStatus,
      };

      await AppointmentsService.update(appointment.id, updateData);

      toast({
        title: "Succès",
        description: `Le statut du rendez-vous a été mis à jour: ${statusLabels[newStatus]}`,
      });

      // Call parent callback to refresh data
      if (onStatusUpdate) {
        onStatusUpdate();
      }

      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du rendez-vous",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "programmé":
        return <CircleDot className="h-4 w-4" />;
      case "confirmé":
        return <PlayCircle className="h-4 w-4" />;
      case "terminé":
        return <CheckCircle className="h-4 w-4" />;
      case "annulé":
        return <XCircle className="h-4 w-4" />;
      default:
        return <CircleDot className="h-4 w-4" />;
    }
  };

  const getAvailableStatusUpdates = () => {
    const currentStatus = appointment.status;
    const allStatuses = ["programmé", "confirmé", "terminé", "annulé"] as const;
    return allStatuses.filter(status => status !== currentStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Détails du rendez-vous
          </DialogTitle>
          <DialogDescription>
            Informations complètes du rendez-vous #{appointment.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className={`text-sm px-4 py-2 ${
                statusColors[appointment.status as keyof typeof statusColors]
              }`}
            >
              {statusLabels[appointment.status as keyof typeof statusLabels]}
            </Badge>
          </div>

          <Separator />

          {/* Quick Status Update */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Mise à jour rapide du statut
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pl-7">
              {getAvailableStatusUpdates().map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdatingStatus}
                  className={`gap-2 ${statusColors[status]} hover:opacity-80 transition-opacity`}
                >
                  {getStatusIcon(status)}
                  {statusLabels[status]}
                </Button>
              ))}
            </div>

            {isUpdatingStatus && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pl-7">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Mise à jour en cours...
              </div>
            )}
          </div>

          <Separator />

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Patient
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <Label>Nom du patient</Label>
                <Value>{appointment.patient_nom}</Value>
              </div>
              <div>
                <Label>Numéro CIN</Label>
                <Value className="font-mono">{appointment.CIN}</Value>
              </div>
            </div>
          </div>

          <Separator />

          {/* Appointment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Détails du Rendez-vous
            </h3>

            <div className="space-y-3 pl-7">
              <div>
                <Label>Type de consultation</Label>
                <Value>{appointment.sujet}</Value>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date et heure du rendez-vous
                </Label>
                <Value className="text-lg font-medium text-primary">
                  {formatDateTime(appointment.date_rendez_vous)}
                </Value>
              </div>
            </div>
          </div>

          <Separator />

          {/* Administrative Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations Administratives
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div>
                <Label>Créé par</Label>
                <Value className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  {appointment.Cree_par}
                </Value>
              </div>
              <div>
                <Label>Date de création</Label>
                <Value className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDate(appointment.created_at)}
                </Value>
              </div>
            </div>
          </div>

          {/* Time Information */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>ID du rendez-vous: #{appointment.id}</span>
              <span>
                Créé le{" "}
                {new Date(appointment.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUpdatingStatus}>
            Fermer
          </Button>

          {onEdit && (
            <Button
              variant="outline"
              onClick={handleEdit}
              className="gap-2"
              disabled={isUpdatingStatus}
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
          )}

          {onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
              disabled={isUpdatingStatus}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper components for consistent styling
function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-sm font-medium text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}

function Value({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-sm text-foreground mt-1 ${className}`}>
      {children}
    </div>
  );
}
