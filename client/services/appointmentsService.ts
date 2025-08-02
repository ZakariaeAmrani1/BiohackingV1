import { ClientsService, Client } from "./clientsService";

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
let mockAppointments: RendezVous[] = [
  {
    id: 1,
    CIN: "BE123456",
    sujet: "Consultation Biohacking",
    date_rendez_vous: "2024-01-15T09:00:00",
    created_at: "2024-01-10T14:30:00",
    Cree_par: "Dr. Smith",
    status: "confirmé",
    patient_nom: "Jean Dupont",
    client_id: 1,
  },
  {
    id: 2,
    CIN: "BE234567",
    sujet: "Thérapie IV",
    date_rendez_vous: "2024-01-15T10:30:00",
    created_at: "2024-01-12T09:15:00",
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Marie Laurent",
    client_id: 2,
  },
  {
    id: 3,
    CIN: "BE345678",
    sujet: "Séance de Cryothérapie",
    date_rendez_vous: "2024-01-16T14:00:00",
    created_at: "2024-01-11T16:45:00",
    Cree_par: "Dr. Smith",
    status: "confirmé",
    patient_nom: "Pierre Martin",
    client_id: 3,
  },
  {
    id: 4,
    CIN: "BE456789",
    sujet: "Analyse du Bilan Sanguin",
    date_rendez_vous: "2024-01-14T11:00:00",
    created_at: "2024-01-08T10:20:00",
    Cree_par: "Dr. Dubois",
    status: "terminé",
    patient_nom: "Sophie Wilson",
    client_id: 4,
  },
  {
    id: 5,
    CIN: "BE567890",
    sujet: "Consultation Bien-être",
    date_rendez_vous: "2024-01-17T15:00:00",
    created_at: "2024-01-13T11:30:00",
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Luc Chen",
    client_id: 5,
  },
  {
    id: 6,
    CIN: "BE678901",
    sujet: "Suivi Post-Traitement",
    date_rendez_vous: "2024-01-12T13:30:00",
    created_at: "2024-01-05T15:10:00",
    Cree_par: "Dr. Smith",
    status: "annulé",
    patient_nom: "Alice Brown",
    client_id: 6,
  },
  {
    id: 7,
    CIN: "BE789012",
    sujet: "Thérapie par Ondes de Choc",
    date_rendez_vous: "2024-01-18T16:30:00",
    created_at: "2024-01-14T08:45:00",
    Cree_par: "Dr. Dubois",
    status: "confirmé",
    patient_nom: "David Garcia",
    client_id: 7,
  },
  {
    id: 8,
    CIN: "BE890123",
    sujet: "Consultation Nutritionnelle",
    date_rendez_vous: "2024-01-19T10:00:00",
    created_at: "2024-01-15T12:20:00",
    Cree_par: "Dr. Martin",
    status: "programmé",
    patient_nom: "Emma Rodriguez",
    client_id: 8,
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

    // Get client information from client_id
    const client = await ClientsService.getById(data.client_id);
    if (!client) {
      throw new Error("Client non trouvé");
    }

    const updatedAppointment: RendezVous = {
      ...mockAppointments[index],
      CIN: client.CIN,
      patient_nom: `${client.prenom} ${client.nom}`,
      sujet: data.sujet,
      date_rendez_vous: data.date_rendez_vous,
      Cree_par: data.Cree_par,
      status: data.status,
      client_id: data.client_id,
    };

    mockAppointments[index] = updatedAppointment;
    return updatedAppointment;
  }

  // Delete appointment
  static async delete(id: number): Promise<boolean> {
    await delay(500);

    const index = mockAppointments.findIndex((apt) => apt.id === id);
    if (index === -1) return false;

    mockAppointments.splice(index, 1);
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
};

// Generate time slots for a specific date
export const generateTimeSlotsForDate = (
  date: Date,
  excludeAppointmentId?: number
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

  // Get existing appointments for this date (excluding the one being edited if applicable)
  const existingAppointments = mockAppointments.filter(
    (apt) => {
      const aptDate = new Date(apt.date_rendez_vous).toISOString().split('T')[0];
      const isOnSameDate = aptDate === dateStr;
      const isNotExcluded = !excludeAppointmentId || apt.id !== excludeAppointmentId;
      return isOnSameDate && isNotExcluded;
    }
  );

  // Generate slots from working hours
  for (let hour = WORKING_HOURS.start; hour < WORKING_HOURS.end; hour++) {
    const slotDate = new Date(date);
    slotDate.setHours(hour, 0, 0, 0);

    // Check if this slot conflicts with existing appointments
    const slotEnd = new Date(slotDate.getTime() + WORKING_HOURS.appointmentDuration * 60000);

    const isAvailable = !existingAppointments.some((apt) => {
      const aptStart = new Date(apt.date_rendez_vous);
      const aptEnd = new Date(aptStart.getTime() + WORKING_HOURS.appointmentDuration * 60000);

      // Check for overlap: slot overlaps with appointment if:
      // slot starts before appointment ends AND slot ends after appointment starts
      return slotDate < aptEnd && slotEnd > aptStart;
    });

    slots.push({
      datetime: slotDate.toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
      time: slotDate.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      available: isAvailable,
    });
  }

  return slots;
};

// Get available dates within a date range (next 30 days by default)
export const getAvailableDates = (
  startDate: Date = new Date(),
  daysAhead: number = 30,
  excludeAppointmentId?: number
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

    const slots = generateTimeSlotsForDate(date, excludeAppointmentId);
    const hasAvailableSlots = slots.some(slot => slot.available);

    dates.push({
      date,
      hasAvailableSlots,
    });
  }

  return dates;
};

// Check if a specific datetime is available
export const isTimeSlotAvailable = (
  datetime: string,
  excludeAppointmentId?: number
): boolean => {
  const slotDate = new Date(datetime);
  const slots = generateTimeSlotsForDate(slotDate, excludeAppointmentId);
  const slot = slots.find(s => s.datetime === datetime);
  return slot?.available ?? false;
};
