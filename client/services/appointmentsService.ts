import { ClientsService, Client } from "./clientsService";
import { ActivitiesService } from "./activitiesService";

// Type matching your database structure
export interface RendezVous {
  id: number;
  CIN: string;
  sujet: string;
  date_rendez_vous: string;
  created_at: string;
  Cree_par: string;
  status?: "programmé" | "confirmé" | "terminé" | "annulé";
  patient_nom?: string; // Additional field for display
  client_id?: number; // Reference to client table
}

// Create/Update form data interface
export interface AppointmentFormData {
  client_id: number;
  sujet: string;
  date_rendez_vous: string;
  Cree_par: string;
  status: "programmé" | "confirmé" | "terminé" | "annulé";
}

// Mock data storage - in real app this would connect to your backend
// Generate current dates for appointments
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(today.getDate() + 2);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);

let mockAppointments: RendezVous[] = [
  {
    id: 1,
    CIN: "BE123456",
    sujet: "Consultation Biohacking",
    date_rendez_vous: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T09:00:00`,
    created_at: `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(threeDaysAgo.getDate()).padStart(2, '0')}T14:30:00`,
    Cree_par: "Dr. Smith",
    status: "confirmé",
    patient_nom: "Jean Dupont",
    client_id: 1,
  },
  {
    id: 2,
    CIN: "BE234567",
    sujet: "Thérapie IV",
    date_rendez_vous: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T10:30:00`,
    created_at: `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}T09:15:00`,
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Marie Laurent",
    client_id: 2,
  },
  {
    id: 3,
    CIN: "BE345678",
    sujet: "Séance de Cryothérapie",
    date_rendez_vous: `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}T14:00:00`,
    created_at: `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}T16:45:00`,
    Cree_par: "Dr. Smith",
    status: "confirmé",
    patient_nom: "Pierre Martin",
    client_id: 3,
  },
  {
    id: 4,
    CIN: "BE456789",
    sujet: "Analyse du Bilan Sanguin",
    date_rendez_vous: `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}T11:00:00`,
    created_at: `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(threeDaysAgo.getDate()).padStart(2, '0')}T10:20:00`,
    Cree_par: "Dr. Dubois",
    status: "terminé",
    patient_nom: "Sophie Wilson",
    client_id: 4,
  },
  {
    id: 5,
    CIN: "BE567890",
    sujet: "Consultation Bien-être",
    date_rendez_vous: `${dayAfterTomorrow.getFullYear()}-${String(dayAfterTomorrow.getMonth() + 1).padStart(2, '0')}-${String(dayAfterTomorrow.getDate()).padStart(2, '0')}T15:00:00`,
    created_at: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T11:30:00`,
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Luc Chen",
    client_id: 5,
  },
  {
    id: 6,
    CIN: "BE678901",
    sujet: "Suivi Post-Traitement",
    date_rendez_vous: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T13:30:00`,
    created_at: `${threeDaysAgo.getFullYear()}-${String(threeDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(threeDaysAgo.getDate()).padStart(2, '0')}T15:10:00`,
    Cree_par: "Dr. Smith",
    status: "annulé",
    patient_nom: "Alice Brown",
    client_id: 6,
  },
  {
    id: 7,
    CIN: "BE789012",
    sujet: "Thérapie par Ondes de Choc",
    date_rendez_vous: `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}T16:30:00`,
    created_at: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T08:45:00`,
    Cree_par: "Dr. Dubois",
    status: "confirmé",
    patient_nom: "David Garcia",
    client_id: 7,
  },
  {
    id: 8,
    CIN: "BE890123",
    sujet: "Consultation Nutritionnelle",
    date_rendez_vous: `${dayAfterTomorrow.getFullYear()}-${String(dayAfterTomorrow.getMonth() + 1).padStart(2, '0')}-${String(dayAfterTomorrow.getDate()).padStart(2, '0')}T10:00:00`,
    created_at: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T12:20:00`,
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Emma Rodriguez",
    client_id: 8,
  },
  {
    id: 9,
    CIN: "BE901234",
    sujet: "Consultation Urgente",
    date_rendez_vous: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T09:00:00`,
    created_at: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T08:00:00`,
    Cree_par: "Dr. Laurent",
    status: "confirmé",
    patient_nom: "Marc Dubois",
    client_id: 9,
  },
  {
    id: 10,
    CIN: "BE012345",
    sujet: "Suivi Thérapeutique",
    date_rendez_vous: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T09:00:00`,
    created_at: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T08:15:00`,
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Lisa Moreau",
    client_id: 10,
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AppointmentsService {
  // Get all appointments
  static async getAll(): Promise<RendezVous[]> {
    await delay(500); // Simulate API delay
    return [...mockAppointments];
  }

  // Get appointment by ID
  static async getById(id: number): Promise<RendezVous | null> {
    await delay(300);
    const appointment = mockAppointments.find((apt) => apt.id === id);
    return appointment || null;
  }

  // Create new appointment
  static async create(data: AppointmentFormData): Promise<RendezVous> {
    await delay(800);

    // Get client information from client_id
    const client = await ClientsService.getById(data.client_id);
    if (!client) {
      throw new Error("Client non trouvé");
    }

    const newAppointment: RendezVous = {
      id: Math.max(...mockAppointments.map((apt) => apt.id)) + 1,
      CIN: client.CIN,
      patient_nom: `${client.prenom} ${client.nom}`,
      sujet: data.sujet,
      date_rendez_vous: data.date_rendez_vous,
      Cree_par: data.Cree_par,
      status: data.status,
      client_id: data.client_id,
      created_at: new Date().toISOString(),
    };

    mockAppointments.push(newAppointment);

    // Log activity
    ActivitiesService.logActivity(
      "appointment",
      "created",
      newAppointment.id,
      `RV-${newAppointment.id.toString().padStart(3, "0")}`,
      data.Cree_par,
      {
        patientName: newAppointment.patient_nom,
        appointmentType: data.sujet,
      },
    );

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("activityLogged"));

    return newAppointment;
  }

  // Update existing appointment
  static async update(
    id: number,
    data: AppointmentFormData,
  ): Promise<RendezVous | null> {
    await delay(800);

    const index = mockAppointments.findIndex((apt) => apt.id === id);
    if (index === -1) return null;

    const existingAppointment = mockAppointments[index];

    // For status-only updates, preserve existing client data
    // Only fetch client data if client_id has changed
    let clientData = {
      CIN: existingAppointment.CIN,
      patient_nom: existingAppointment.patient_nom,
    };

    // Only fetch client if client_id has changed
    if (data.client_id !== existingAppointment.client_id) {
      const client = await ClientsService.getById(data.client_id);
      if (!client) {
        throw new Error("Client non trouvé");
      }
      clientData = {
        CIN: client.CIN,
        patient_nom: `${client.prenom} ${client.nom}`,
      };
    }

    const updatedAppointment: RendezVous = {
      ...existingAppointment,
      CIN: clientData.CIN,
      patient_nom: clientData.patient_nom,
      sujet: data.sujet,
      date_rendez_vous: data.date_rendez_vous,
      Cree_par: data.Cree_par,
      status: data.status,
      client_id: data.client_id,
    };

    mockAppointments[index] = updatedAppointment;

    // Log activity
    ActivitiesService.logActivity(
      "appointment",
      "updated",
      id,
      `RV-${id.toString().padStart(3, "0")}`,
      data.Cree_par,
      {
        patientName: updatedAppointment.patient_nom,
        appointmentType: data.sujet,
      },
    );

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("activityLogged"));

    return updatedAppointment;
  }

  // Delete appointment
  static async delete(id: number): Promise<boolean> {
    await delay(500);

    const index = mockAppointments.findIndex((apt) => apt.id === id);
    if (index === -1) return false;

    const deletedAppointment = mockAppointments[index];
    mockAppointments.splice(index, 1);

    // Log activity
    ActivitiesService.logActivity(
      "appointment",
      "deleted",
      id,
      `RV-${id.toString().padStart(3, "0")}`,
      "System", // We don't have user context in delete, could be improved
      {
        patientName: deletedAppointment.patient_nom,
        appointmentType: deletedAppointment.sujet,
      },
    );

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("activityLogged"));

    return true;
  }

  // Search appointments
  static async search(query: string): Promise<RendezVous[]> {
    await delay(300);

    const lowerQuery = query.toLowerCase();
    return mockAppointments.filter(
      (appointment) =>
        appointment.patient_nom?.toLowerCase().includes(lowerQuery) ||
        appointment.CIN.toLowerCase().includes(lowerQuery) ||
        appointment.sujet.toLowerCase().includes(lowerQuery),
    );
  }

  // Filter appointments
  static async filter(filters: {
    status?: string;
    creator?: string;
    dateRange?: string;
  }): Promise<RendezVous[]> {
    await delay(300);

    return mockAppointments.filter((appointment) => {
      if (
        filters.status &&
        filters.status !== "tous" &&
        appointment.status !== filters.status
      ) {
        return false;
      }

      if (
        filters.creator &&
        filters.creator !== "tous" &&
        appointment.Cree_par !== filters.creator
      ) {
        return false;
      }

      // Add date filtering logic if needed

      return true;
    });
  }
}

// Utility functions for validation
export const validateAppointmentData = (
  data: AppointmentFormData,
  excludeAppointmentId?: number,
): string[] => {
  const errors: string[] = [];

  if (!data.client_id || data.client_id <= 0) {
    errors.push("Veuillez sélectionner un patient");
  }

  if (!data.sujet.trim()) {
    errors.push("Le sujet du rendez-vous est obligatoire");
  }

  if (!data.date_rendez_vous) {
    errors.push("La date et l'heure sont obligatoires");
  } else {
    const appointmentDate = new Date(data.date_rendez_vous);
    const now = new Date();
    if (appointmentDate < now) {
      errors.push("La date du rendez-vous ne peut pas être dans le passé");
    }

    // Check if the selected time slot is available
    if (!isTimeSlotAvailable(data.date_rendez_vous, excludeAppointmentId)) {
      errors.push(
        "Ce créneau horaire n'est plus disponible. Veuillez sélectionner un autre créneau.",
      );
    }
  }

  if (!data.Cree_par.trim()) {
    errors.push("Le créateur est obligatoire");
  }

  return errors;
};

// Get available doctors/creators
export const getAvailableDoctors = (): string[] => {
  return ["Dr. Smith", "Dr. Martin", "Dr. Dubois", "Dr. Laurent"];
};

// Get appointment subjects/types
export const getAppointmentTypes = (): string[] => {
  return [
    "Consultation Biohacking",
    "Thérapie IV",
    "Séance de Cryothérapie",
    "Analyse du Bilan Sanguin",
    "Consultation Bien-être",
    "Suivi Post-Traitement",
    "Thérapie par Ondes de Choc",
    "Consultation Nutritionnelle",
    "Examen Médical Complet",
    "Thérapie par la Lumière",
    "Consultation Hormonale",
    "Séance de Récupération",
  ];
};

// Time slot interface
export interface TimeSlot {
  datetime: string;
  time: string;
  available: boolean;
}

// Working hours configuration
const WORKING_HOURS = {
  start: 8, // 8 AM
  end: 18, // 6 PM
  appointmentDuration: 60, // 1 hour in minutes
  slotInterval: 15, // 15 minutes intervals
};

// Generate time slots for a specific date
export const generateTimeSlotsForDate = (
  date: Date,
  excludeAppointmentId?: number,
): TimeSlot[] => {
  const slots: TimeSlot[] = [];

  // Generate slots from working hours with 15-minute intervals
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    for (let minute = 0; minute < 60; minute += WORKING_HOURS.slotInterval) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, minute, 0, 0);

      // All slots are available (removed conflict checking logic)
      slots.push({
        datetime: slotDate.toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
        time: slotDate.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        available: true, // Always available - no conflict checking
      });
    }
  }

  return slots;
};

// Get available dates within a date range (next 30 days by default)
export const getAvailableDates = (
  startDate: Date = new Date(),
  daysAhead: number = 30,
  excludeAppointmentId?: number,
): { date: Date; hasAvailableSlots: boolean }[] => {
  const dates: { date: Date; hasAvailableSlots: boolean }[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Skip weekends (optional - can be configured)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue; // Skip Sunday (0) and Saturday (6)
    }

    // All dates are now available since we removed conflict checking
    dates.push({
      date,
      hasAvailableSlots: true, // Always true - no conflict checking
    });
  }

  return dates;
};

// Check if a specific datetime is available
export const isTimeSlotAvailable = (
  datetime: string,
  excludeAppointmentId?: number,
): boolean => {
  // All time slots are now available - no conflict checking
  return true;
};
