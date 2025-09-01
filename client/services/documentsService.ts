// Document types
export interface Document {
  id: number;
  template_id: number;
  CIN: string;
  data_json: Record<string, any>;
  Cree_par: string;
  created_at: string;
}

export interface DocumentFormData {
  template_id: number;
  CIN: string;
  data_json: Record<string, any>;
  Cree_par: string;
}

// Mock data storage
let mockDocuments: Document[] = [
  {
    id: 1,
    template_id: 1, // Consultation Médicale Standard
    CIN: "BE123456",
    data_json: {
      "Date de consultation": "2024-01-15",
      "Motif de consultation": "Contrôle de routine",
      "Durée (minutes)": 30,
      "Tension artérielle": "120/80",
      "Poids (kg)": 75,
      "Taille (cm)": 175,
      "Température (°C)": 36.5,
      "Symptômes observés": "Aucun symptôme particulier observé",
      Diagnostic: "État de santé général bon",
      Recommandations:
        "Maintenir un mode de vie sain, prochain contrôle dans 6 mois",
    },
    Cree_par: "Dr. Smith",
    created_at: "2024-01-15T10:30:00",
  },
  {
    id: 2,
    template_id: 2, // Évaluation Psychologique
    CIN: "BE123456",
    data_json: {
      "Niveau de stress": "Modéré",
      "Humeur générale": "Bonne",
      "Troubles du sommeil": false,
      Concentration: "Bonne",
      Mémoire: "Excellente",
      "Notes additionnelles":
        "Patient montre des signes de fatigue liés au travail",
    },
    Cree_par: "Dr. Martin",
    created_at: "2024-01-20T14:20:00",
  },
  {
    id: 3,
    template_id: 1, // Consultation Médicale Standard
    CIN: "BE234567",
    data_json: {
      "Date de consultation": "2024-01-18",
      "Motif de consultation": "Suivi post-vaccination",
      "Durée (minutes)": 15,
      "Tension artérielle": "110/70",
      "Poids (kg)": 65,
      "Taille (cm)": 168,
      "Température (°C)": 36.2,
      "Symptômes observés": "Légère douleur au point d'injection",
      Diagnostic: "Réaction normale post-vaccination",
      Recommandations: "Surveillance des symptômes, paracétamol si nécessaire",
    },
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-18T09:15:00",
  },
  {
    id: 4,
    template_id: 3, // Suivi Post-Opératoire
    CIN: "BE345678",
    data_json: {
      "Type d'intervention": "Arthroscopie du genou",
      "Date de l'opération": "2023-12-15",
      Chirurgien: "Dr. Laurent",
      "Niveau de douleur (1-10)": 3,
      Cicatrisation: "Bonne",
      Mobilité: "Limitée",
      Complications:
        "Aucune complication observée, récupération dans les normes",
    },
    Cree_par: "Dr. Smith",
    created_at: "2024-01-10T16:45:00",
  },
  {
    id: 5,
    template_id: 1, // Consultation Médicale Standard
    CIN: "BE456789",
    data_json: {
      "Date de consultation": "2024-01-22",
      "Motif de consultation": "Migraine persistante",
      "Durée (minutes)": 45,
      "Tension artérielle": "130/85",
      "Poids (kg)": 62,
      "Taille (cm)": 165,
      "Température (°C)": 36.8,
      "Symptômes observés": "Maux de tête fréquents, sensibilité à la lumière",
      Diagnostic: "Migraine chronique - ajustement du traitement",
      Recommandations:
        "Nouveau traitement préventif, éviter les déclencheurs identifiés",
    },
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-22T11:30:00",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class DocumentsService {
  // Get all documents
  static async getAll(): Promise<Document[]> {
    await delay(500);
    return [...mockDocuments];
  }

  // Get documents by patient CIN
  static async getByPatientCIN(cin: string): Promise<Document[]> {
    await delay(500);
    return mockDocuments.filter((doc) => doc.CIN === cin);
  }

  // Get document by ID
  static async getById(id: number): Promise<Document | null> {
    await delay(300);
    const document = mockDocuments.find((doc) => doc.id === id);
    return document || null;
  }

  // Create new document
  static async create(data: DocumentFormData): Promise<Document> {
    await delay(800);

    const newDocument: Document = {
      id: Math.max(...mockDocuments.map((doc) => doc.id)) + 1,
      ...data,
      created_at: new Date().toISOString(),
    };

    mockDocuments.push(newDocument);
    return newDocument;
  }

  // Update existing document
  static async update(
    id: number,
    data: DocumentFormData,
  ): Promise<Document | null> {
    await delay(800);

    const index = mockDocuments.findIndex((doc) => doc.id === id);
    if (index === -1) return null;

    const updatedDocument: Document = {
      ...mockDocuments[index],
      ...data,
    };

    mockDocuments[index] = updatedDocument;
    return updatedDocument;
  }

  // Delete document
  static async delete(id: number): Promise<boolean> {
    await delay(500);

    const index = mockDocuments.findIndex((doc) => doc.id === id);
    if (index === -1) return false;

    mockDocuments.splice(index, 1);
    return true;
  }

  // Search documents
  static async search(query: string, cin?: string): Promise<Document[]> {
    await delay(300);

    const lowerQuery = query.toLowerCase();
    let filteredDocs = mockDocuments;

    if (cin) {
      filteredDocs = filteredDocs.filter((doc) => doc.CIN === cin);
    }

    return filteredDocs.filter(
      (doc) =>
        doc.Cree_par.toLowerCase().includes(lowerQuery) ||
        JSON.stringify(doc.data_json).toLowerCase().includes(lowerQuery),
    );
  }

  // Get documents by template ID
  static async getByTemplateId(templateId: number): Promise<Document[]> {
    await delay(300);
    return mockDocuments.filter((doc) => doc.template_id === templateId);
  }
}

// Validation functions
export const validateDocumentData = (data: DocumentFormData): string[] => {
  const errors: string[] = [];

  if (!data.template_id) {
    errors.push("Le modèle de document est obligatoire");
  }

  if (!data.CIN.trim()) {
    errors.push("Le CIN du patient est obligatoire");
  }

  if (!data.Cree_par.trim()) {
    errors.push("Le créateur est obligatoire");
  }

  if (!data.data_json || Object.keys(data.data_json).length === 0) {
    errors.push("Les données du document sont obligatoires");
  }

  return errors;
};

// Utility functions
export const getAvailableDoctors = (): string[] => {
  return ["Dr. Smith", "Dr. Martin", "Dr. Dubois", "Dr. Laurent"];
};

export const createEmptyDocumentData = (): DocumentFormData => {
  return {
    template_id: 0,
    CIN: "",
    data_json: {},
    Cree_par: "",
  };
};

// Compute a stable storage key for a field based on its position in the template
export const computeFieldKey = (
  templateId: number,
  sectionIndex: number,
  fieldIndex: number,
): string => {
  return `fld:${templateId}:${sectionIndex}:${fieldIndex}`;
};

// Helper function to get field value from document data with support for fallback by name
export const getFieldValue = (
  data: Record<string, any>,
  fieldKeyOrName: string,
  fallbackName?: string,
): any => {
  if (Object.prototype.hasOwnProperty.call(data, fieldKeyOrName)) {
    return data[fieldKeyOrName];
  }
  if (
    fallbackName &&
    Object.prototype.hasOwnProperty.call(data, fallbackName)
  ) {
    return data[fallbackName];
  }
  return "";
};

// Helper function to set field value in document data, migrating away from name-based keys if needed
export const setFieldValue = (
  data: Record<string, any>,
  fieldKeyOrName: string,
  value: any,
  fallbackName?: string,
): Record<string, any> => {
  const next = { ...data, [fieldKeyOrName]: value } as Record<string, any>;
  // If we provided a fallback name (old name-based key), remove it to avoid duplication
  if (
    fallbackName &&
    fallbackName !== fieldKeyOrName &&
    Object.prototype.hasOwnProperty.call(next, fallbackName)
  ) {
    delete next[fallbackName];
  }
  return next;
};

// Helper to format document data for display
export const formatDocumentData = (
  data: Record<string, any>,
): Array<{ key: string; value: any }> => {
  return Object.entries(data).map(([key, value]) => ({
    key,
    value,
  }));
};
