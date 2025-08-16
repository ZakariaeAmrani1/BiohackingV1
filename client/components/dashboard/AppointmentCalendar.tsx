import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import AppointmentFormModal from "@/components/appointments/AppointmentFormModal";
import AppointmentDetailsModal from "@/components/appointments/AppointmentDetailsModal";
import DeleteConfirmationModal from "@/components/appointments/DeleteConfirmationModal";
import {
  AppointmentFormData,
  AppointmentsService,
  RendezVous,
} from "@/services/appointmentsService";

const statusColors = {
  "programmé": "bg-blue-100 text-blue-700 border-blue-200",
  "confirmé": "bg-green-100 text-green-700 border-green-200",
  "terminé": "bg-gray-100 text-gray-700 border-gray-200",
  "annulé": "bg-red-100 text-red-700 border-red-200",
};

const statusTranslations = {
  "programmé": "programmé",
  "confirmé": "confirmé", 
  "terminé": "terminé",
  "annulé": "annulé",
};

export default function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "day">("week");
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Details modal state
  const [selectedAppointment, setSelectedAppointment] = useState<RendezVous | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Edit modal state
  const [appointmentToEdit, setAppointmentToEdit] = useState<RendezVous | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Delete modal state
  const [appointmentToDelete, setAppointmentToDelete] = useState<RendezVous | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  // Load appointments on component mount and listen for activity updates
  useEffect(() => {
    loadAppointments();

    const handleActivityLogged = () => {
      // Only reload if no modal is open to prevent interference
      if (!isDetailsModalOpen && !isEditModalOpen && !isDeleteModalOpen && !isAppointmentModalOpen) {
        loadAppointments();
      }
    };

    window.addEventListener('activityLogged', handleActivityLogged);

    return () => {
      window.removeEventListener('activityLogged', handleActivityLogged);
    };
  }, [isDetailsModalOpen, isEditModalOpen, isDeleteModalOpen, isAppointmentModalOpen]);

  const weekDays = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  const timeSlots = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const appointmentsData = await AppointmentsService.getAll();
      setAppointments(appointmentsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les rendez-vous",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const appointmentDate = new Date(apt.date_rendez_vous);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  const getTimeFromDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleAppointmentClick = (appointment: RendezVous) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdateSuccess = () => {
    // Reload appointments after status update
    loadAppointments();
  };

  const handleEditAppointment = (appointment: RendezVous) => {
    setAppointmentToEdit(appointment);
    setIsEditModalOpen(true);
    setIsDetailsModalOpen(false);
  };

  const handleDeleteAppointment = (appointment: RendezVous) => {
    setAppointmentToDelete(appointment);
    setIsDeleteModalOpen(true);
    setIsDetailsModalOpen(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleCreateAppointment = async (data: AppointmentFormData) => {
    try {
      setIsSubmitting(true);
      await AppointmentsService.create(data);
      setIsAppointmentModalOpen(false);
      await loadAppointments(); // Reload appointments
      toast({
        title: "Succès",
        description: "Le rendez-vous a été créé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAppointment = async (data: AppointmentFormData) => {
    if (!appointmentToEdit) return;
    
    try {
      setIsSubmitting(true);
      await AppointmentsService.update(appointmentToEdit.id, data);
      setIsEditModalOpen(false);
      setAppointmentToEdit(null);
      await loadAppointments(); // Reload appointments
      toast({
        title: "Succès",
        description: "Le rendez-vous a été modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rendez-vous",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      setIsDeleting(true);
      await AppointmentsService.delete(appointmentToDelete.id);
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
      await loadAppointments(); // Reload appointments
      toast({
        title: "Succès",
        description: "Le rendez-vous a été supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rendez-vous",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold">
            Calendrier des Rendez-vous
          </CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex rounded-lg border border-border p-1">
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className="h-8"
              >
                Semaine
              </Button>
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className="h-8"
              >
                Journée
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek("prev")}
                className="h-8 w-8 flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[120px] text-center text-sm font-medium px-2">
                {currentDate.toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateWeek("next")}
                className="h-8 w-8 flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsAppointmentModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nouveau Rendez-vous
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {view === "week" ? (
          <div className="overflow-x-auto grid grid-cols-8 border-t border-border min-w-[700px]">
            {/* Time column */}
            <div className="border-r border-border">
              <div className="h-12 border-b border-border"></div>
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-20 border-b border-border px-2 py-1 text-xs text-muted-foreground"
                >
                  {time}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {getWeekDates().map((date, dayIndex) => (
              <div
                key={dayIndex}
                className={`border-r border-border last:border-r-0 ${
                  isToday(date) ? "bg-primary/5" : ""
                }`}
              >
                <div
                  className={`h-12 border-b border-border px-2 py-2 text-center ${
                    isToday(date) ? "bg-primary/10 border-primary/20" : ""
                  }`}
                >
                  <div
                    className={`text-xs font-medium ${
                      isToday(date) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {weekDays[dayIndex]}
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      isToday(date) ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {formatDate(date)}
                    {isToday(date) && (
                      <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </div>
                </div>
                {timeSlots.map((time, timeIndex) => {
                  const dayAppointments = getAppointmentsForDate(date);
                  const timeAppointments = dayAppointments.filter((apt) => {
                    const appointmentTime = getTimeFromDateTime(apt.date_rendez_vous);
                    return appointmentTime === time;
                  });

                  return (
                    <div
                      key={timeIndex}
                      className="h-20 border-b border-border p-1 relative"
                    >
                      {timeAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          onClick={() => handleAppointmentClick(appointment)}
                          className="absolute inset-x-1 top-1 bottom-1 rounded-md bg-primary/10 border border-primary/20 p-2 text-xs overflow-hidden cursor-pointer hover:bg-primary/20 transition-colors"
                        >
                          <div className="font-medium text-primary truncate">
                            {appointment.patient_nom}
                          </div>
                          <div className="text-muted-foreground truncate">
                            {appointment.sujet}
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs mt-1 ${statusColors[appointment.status as keyof typeof statusColors]}`}
                          >
                            {
                              statusTranslations[
                                appointment.status as keyof typeof statusTranslations
                              ]
                            }
                          </Badge>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-4">
              {getAppointmentsForDate(currentDate).map((appointment) => (
                <div
                  key={appointment.id}
                  onClick={() => handleAppointmentClick(appointment)}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {getTimeFromDateTime(appointment.date_rendez_vous)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.patient_nom}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.sujet}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      statusColors[
                        appointment.status as keyof typeof statusColors
                      ]
                    }
                  >
                    {
                      statusTranslations[
                        appointment.status as keyof typeof statusTranslations
                      ]
                    }
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Appointment Creation Modal */}
      <AppointmentFormModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSubmit={handleCreateAppointment}
        isLoading={isSubmitting}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
        onStatusUpdate={handleStatusUpdateSuccess}
      />

      {/* Appointment Edit Modal */}
      <AppointmentFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setAppointmentToEdit(null);
        }}
        onSubmit={handleUpdateAppointment}
        appointment={appointmentToEdit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setAppointmentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        appointment={appointmentToDelete}
        isLoading={isDeleting}
      />
    </Card>
  );
}
