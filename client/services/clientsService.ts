// Type matching your database structure
export interface Client {
  id: number;
  CIN: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  adresse: string;
  numero_telephone: string;
  email: string;
  groupe_sanguin: string;
  antecedents: string;
  allergies: string;
  commentaire: string;
  created_at: string;
  Cree_par: string;
}

// Create/Update form data interface
export interface ClientFormData {
  CIN: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  adresse: string;
  numero_telephone: string;
  email: string;
  groupe_sanguin: string;
  antecedents: string;
  allergies: string;
  commentaire: string;
  Cree_par: string;
}

import { ActivitiesService } from "./activitiesService";

// Mock data storage - in real app this would connect to your backend
let mockClients: Client[] = [
  {
    id: 1,
    CIN: "BE123456",
    nom: "Dupont",
    prenom: "Jean",
    date_naissance: "1985-03-15T00:00:00",
    adresse: "123 Rue de la Santé, Bruxelles",
    numero_telephone: "+32 2 123 45 67",
    email: "jean.dupont@email.com",
    groupe_sanguin: "O+",
    antecedents: "Hypertension, Diabète type 2",
    allergies: "Pénicilline, Arachides",
    commentaire: "Patient très coopératif, suit bien les traitements",
    created_at: "2024-01-01T10:30:00",
    Cree_par: "Dr. Smith",
  },
  {
    id: 2,
    CIN: "BE234567",
    nom: "Laurent",
    prenom: "Marie",
    date_naissance: "1992-07-22T00:00:00",
    adresse: "456 Avenue des Fleurs, Liège",
    numero_telephone: "+32 4 234 56 78",
    email: "marie.laurent@email.com",
    groupe_sanguin: "A+",
    antecedents: "Aucun antécédent majeur",
    allergies: "Latex",
    commentaire: "Patiente sportive, bonne condition physique générale",
    created_at: "2024-01-02T14:20:00",
    Cree_par: "Dr. Martin",
  },
  {
    id: 3,
    CIN: "BE345678",
    nom: "Martin",
    prenom: "Pierre",
    date_naissance: "1978-11-08T00:00:00",
    adresse: "789 Boulevard du Roi, Gand",
    numero_telephone: "+32 9 345 67 89",
    email: "pierre.martin@email.com",
    groupe_sanguin: "B-",
    antecedents: "Chirurgie du genou (2015), Asthme léger",
    allergies: "Pollen, Poussière",
    commentaire: "Recommandé éviter les exercices intensifs",
    created_at: "2024-01-03T09:15:00",
    Cree_par: "Dr. Smith",
  },
  {
    id: 4,
    CIN: "BE456789",
    nom: "Wilson",
    prenom: "Sophie",
    date_naissance: "1990-05-14T00:00:00",
    adresse: "321 Rue de l'Espoir, Anvers",
    numero_telephone: "+32 3 456 78 90",
    email: "sophie.wilson@email.com",
    groupe_sanguin: "AB+",
    antecedents: "Migraine chronique",
    allergies: "Aucune allergie connue",
    commentaire: "Suivi régulier pour migraines, répond bien au traitement",
    created_at: "2024-01-04T16:45:00",
    Cree_par: "Dr. Dubois",
  },
  {
    id: 5,
    CIN: "BE567890",
    nom: "Chen",
    prenom: "Luc",
    date_naissance: "1988-12-03T00:00:00",
    adresse: "654 Place du Marché, Charleroi",
    numero_telephone: "+32 71 567 89 01",
    email: "luc.chen@email.com",
    groupe_sanguin: "O-",
    antecedents: "Fracture du bras (2020)",
    allergies: "Fruits de mer",
    commentaire: "Donneur universel, très impliqué dans sa santé",
    created_at: "2024-01-05T11:30:00",
    Cree_par: "Dr. Martin",
  },
  {
    id: 6,
    CIN: "BE678901",
    nom: "Brown",
    prenom: "Alice",
    date_naissance: "1995-09-18T00:00:00",
    adresse: "987 Chemin des Roses, Namur",
    numero_telephone: "+32 81 678 90 12",
    email: "alice.brown@email.com",
    groupe_sanguin: "A-",
    antecedents: "Aucun",
    allergies: "Iode",
    commentaire: "Jeune patiente, première consultation",
    created_at: "2024-01-06T13:20:00",
    Cree_par: "Dr. Smith",
  },
  {
    id: 7,
    CIN: "BE789012",
    nom: "Garcia",
    prenom: "David",
    date_naissance: "1982-04-25T00:00:00",
    adresse: "147 Rue du Soleil, Mons",
    numero_telephone: "+32 65 789 01 23",
    email: "david.garcia@email.com",
    groupe_sanguin: "B+",
    antecedents: "Cholestérol élevé, Apnée du sommeil",
    allergies: "Aspirine",
    commentaire: "Suivi cardiologique recommandé",
    created_at: "2024-01-07T08:10:00",
    Cree_par: "Dr. Dubois",
  },
  {
    id: 8,
    CIN: "BE890123",
    nom: "Rodriguez",
    prenom: "Emma",
    date_naissance: "1993-01-30T00:00:00",
    adresse: "258 Avenue de la Paix, Louvain",
    numero_telephone: "+32 16 890 12 34",
    email: "emma.rodriguez@email.com",
    groupe_sanguin: "AB-",
    antecedents: "Thyroïde hyperactive",
    allergies: "Colorants alimentaires",
    commentaire: "Contrôle thyroïdien tous les 6 mois",
    created_at: "2024-01-08T15:40:00",
    Cree_par: "Dr. Martin",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class ClientsService {
  // Get all clients
  static async getAll(): Promise<Client[]> {
    await delay(500); // Simulate API delay
    return [...mockClients];
  }

  // Get client by ID
  static async getById(id: number): Promise<Client | null> {
    await delay(300);
    const client = mockClients.find((client) => client.id === id);
    return client || null;
  }

  // Create new client
  static async create(data: ClientFormData): Promise<Client> {
    await delay(800);

    const newClient: Client = {
      id: Math.max(...mockClients.map((client) => client.id)) + 1,
      ...data,
      created_at: new Date().toISOString(),
    };

    mockClients.push(newClient);

    // Log activity
    ActivitiesService.logActivity(
      "patient",
      "created",
      newClient.id,
      `${newClient.prenom} ${newClient.nom}`,
      data.Cree_par,
    );

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("activityLogged"));

    return newClient;
  }

  // Update existing client
  static async update(
    id: number,
    data: ClientFormData,
  ): Promise<Client | null> {
    await delay(800);

    const index = mockClients.findIndex((client) => client.id === id);
    if (index === -1) return null;

    const updatedClient: Client = {
      ...mockClients[index],
      ...data,
    };

    mockClients[index] = updatedClient;

    // Log activity
    ActivitiesService.logActivity(
      "patient",
      "updated",
      id,
      `${updatedClient.prenom} ${updatedClient.nom}`,
      data.Cree_par,
    );

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("activityLogged"));

    return updatedClient;
  }

  // Delete client
  static async delete(id: number): Promise<boolean> {
    await delay(500);

    const index = mockClients.findIndex((client) => client.id === id);
    if (index === -1) return false;

    const deletedClient = mockClients[index];
    mockClients.splice(index, 1);

    // Log activity
    ActivitiesService.logActivity(
      "patient",
      "deleted",
      id,
      `${deletedClient.prenom} ${deletedClient.nom}`,
      "System", // Could be improved to track actual user
    );

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent("activityLogged"));

    return true;
  }

  // Search clients
  static async search(query: string): Promise<Client[]> {
    await delay(300);

    const lowerQuery = query.toLowerCase();
    return mockClients.filter(
      (client) =>
        client.nom.toLowerCase().includes(lowerQuery) ||
        client.prenom.toLowerCase().includes(lowerQuery) ||
        client.CIN.toLowerCase().includes(lowerQuery) ||
        client.email.toLowerCase().includes(lowerQuery) ||
        client.numero_telephone.includes(query),
    );
  }

  // Filter clients
  static async filter(filters: {
    groupeSanguin?: string;
    creator?: string;
    ageRange?: string;
  }): Promise<Client[]> {
    await delay(300);

    return mockClients.filter((client) => {
      if (
        filters.groupeSanguin &&
        filters.groupeSanguin !== "tous" &&
        client.groupe_sanguin !== filters.groupeSanguin
      ) {
        return false;
      }

      if (
        filters.creator &&
        filters.creator !== "tous" &&
        client.Cree_par !== filters.creator
      ) {
        return false;
      }

      // Add age filtering logic if needed

      return true;
    });
  }
}

// Utility functions for validation
export const validateClientData = (data: ClientFormData): string[] => {
  const errors: string[] = [];

  if (!data.CIN.trim()) {
    errors.push("Le CIN est obligatoire");
  } else if (!/^[A-Z]{2}\d{6}$/.test(data.CIN)) {
    errors.push("Le CIN doit suivre le format BE123456");
  }

  if (!data.nom.trim()) {
    errors.push("Le nom est obligatoire");
  }

  if (!data.prenom.trim()) {
    errors.push("Le prénom est obligatoire");
  }

  if (!data.date_naissance) {
    errors.push("La date de naissance est obligatoire");
  } else {
    const birthDate = new Date(data.date_naissance);
    const now = new Date();
    const age = now.getFullYear() - birthDate.getFullYear();
    if (age < 0 || age > 120) {
      errors.push("La date de naissance n'est pas valide");
    }
  }

  if (!data.adresse.trim()) {
    errors.push("L'adresse est obligatoire");
  }

  if (!data.numero_telephone.trim()) {
    errors.push("Le numéro de téléphone est obligatoire");
  } else if (
    !/^(\+32|0)[1-9]\d{7,8}$/.test(data.numero_telephone.replace(/\s/g, ""))
  ) {
    errors.push("Le numéro de téléphone n'est pas au format belge valide");
  }

  if (!data.email.trim()) {
    errors.push("L'email est obligatoire");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("L'email n'est pas valide");
  }

  if (!data.groupe_sanguin.trim()) {
    errors.push("Le groupe sanguin est obligatoire");
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

// Get blood groups
export const getBloodGroups = (): string[] => {
  return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
};

// Calculate age from birth date
export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};
