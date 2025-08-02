import { useState, useEffect } from "react";
import {
  CalendarDays,
  Search,
  FileText,
  Clock,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import TimeSlotPicker from "./TimeSlotPicker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AppointmentFormData,
  RendezVous,
  validateAppointmentData,
  getAvailableDoctors,
  getAppointmentTypes,
} from "@/services/appointmentsService";
import {
  ClientsService,
  Client,
  calculateAge,
} from "@/services/clientsService";

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
    client_id: 0,
    sujet: "",
    date_rendez_vous: "",
    Cree_par: "",
    status: "programmé",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");

  const isEditMode = !!appointment;
  const availableDoctors = getAvailableDoctors();
  const appointmentTypes = getAppointmentTypes();

  // Load clients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      // Convert ISO string to datetime-local format
      const dateTime = appointment.date_rendez_vous
        ? new Date(appointment.date_rendez_vous).toISOString().slice(0, 16)
        : "";

      setFormData({
        client_id: appointment.client_id || 0,
        sujet: appointment.sujet || "",
        date_rendez_vous: dateTime,
        Cree_par: appointment.Cree_par || "",
        status: appointment.status || "programmé",
      });

      // Find and set the selected client if we have a client_id
      if (appointment.client_id) {
        findClientById(appointment.client_id);
      }
    } else {
      // Reset form for new appointment
      setFormData({
        client_id: 0,
        sujet: "",
        date_rendez_vous: "",
        Cree_par: "",
        status: "programmé",
      });
      setSelectedClient(null);
    }
    setErrors([]);
  }, [appointment, isOpen]);

  const loadClients = async () => {
    try {
      const clientsData = await ClientsService.getAll();
      setClients(clientsData);
    } catch (error) {
      setErrors(["Erreur lors du chargement des patients"]);
    }
  };

  const findClientById = async (clientId: number) => {
    try {
      const client = await ClientsService.getById(clientId);
      setSelectedClient(client);
    } catch (error) {
      console.error("Error finding client:", error);
    }
  };

  const handleInputChange = (
    field: keyof AppointmentFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData((prev) => ({ ...prev, client_id: client.id }));
    setIsClientSelectorOpen(false);
    setClientSearchQuery("");
    // Clear errors when client is selected
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const filteredClients = clients.filter((client) => {
    const searchTerm = clientSearchQuery.toLowerCase();
    return (
      client.nom.toLowerCase().includes(searchTerm) ||
      client.prenom.toLowerCase().includes(searchTerm) ||
      client.CIN.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateAppointmentData(formData, appointment?.id);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Don't call onClose here - let the parent handle it
    } catch (error) {
      setErrors(["Une erreur s'est produite lors de l'enregistrement"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form and errors when closing
      setErrors([]);
      setSelectedClient(null);
      setClientSearchQuery("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {isEditMode ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifiez les informations du rendez-vous"
              : "Créez un nouveau rendez-vous en sélectionnant un patient et en remplissant les informations"}
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
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sélectionner un patient
            </Label>

            <Popover
              open={isClientSelectorOpen}
              onOpenChange={setIsClientSelectorOpen}
              modal={true}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isClientSelectorOpen}
                  className="w-full justify-between"
                  disabled={isSubmitting}
                >
                  {selectedClient ? (
                    <div className="flex items-center gap-2">
                      <span>
                        {selectedClient.prenom} {selectedClient.nom}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {selectedClient.CIN}
                      </Badge>
                    </div>
                  ) : (
                    "Rechercher et sélectionner un patient..."
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[500px] p-0 z-[60] shadow-lg border-2"
                sideOffset={5}
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Rechercher par nom, prénom, CIN, email..."
                    value={clientSearchQuery}
                    onValueChange={setClientSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
                    <CommandGroup>
                      {filteredClients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={`${client.prenom} ${client.nom} ${client.CIN} ${client.email}`}
                          onSelect={() => handleClientSelect(client)}
                          className="flex items-center justify-between p-3"
                        >
                          <div className="flex flex-col">
                            <div className="font-medium">
                              {client.prenom} {client.nom}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {client.CIN} •{" "}
                              {calculateAge(client.date_naissance)} ans •{" "}
                              {client.email}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {client.groupe_sanguin}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedClient && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {selectedClient.prenom} {selectedClient.nom}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      CIN: {selectedClient.CIN} • Âge:{" "}
                      {calculateAge(selectedClient.date_naissance)} ans
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Email: {selectedClient.email} • Tél:{" "}
                      {selectedClient.numero_telephone}
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    {selectedClient.groupe_sanguin}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Appointment Type */}
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

          {/* Date and Time Slot Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Date et heure du rendez-vous
            </Label>
            <TimeSlotPicker
              value={formData.date_rendez_vous}
              onChange={(datetime) => handleInputChange("date_rendez_vous", datetime)}
              excludeAppointmentId={appointment?.id}
              disabled={isSubmitting}
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

          {/* Status - only show in edit mode */}
          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleInputChange(
                    "status",
                    value as AppointmentFormData["status"],
                  )
                }
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
              ) : isEditMode ? (
                "Modifier"
              ) : (
                "Créer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
