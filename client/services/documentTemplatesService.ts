// Document template types
export interface DocumentField {
  name: string;
  type: "text" | "number" | "textarea" | "date" | "select" | "checkbox";
  required?: boolean;
  options?: string[]; // For select fields
}

export interface DocumentSection {
  title: string;
  fields: DocumentField[];
}

export interface DocumentTemplate {
  id: number;
  name: string;
  sections_json: {
    sections: DocumentSection[];
  };
  Cree_par: string;
  created_at: string;
}

export interface DocumentTemplateFormData {
  name: string;
  sections_json: {
    sections: DocumentSection[];
  };
  Cree_par: string;
}

// Mock data storage
let mockTemplates: DocumentTemplate[] = [
  {
    id: 1,
    name: "Consultation Médicale Standard",
    sections_json: {
      sections: [
        {
          title: "Informations Générales",
          fields: [
            { name: "Date de consultation", type: "date", required: true },
            { name: "Motif de consultation", type: "textarea", required: true },
            { name: "Durée (minutes)", type: "number", required: false },
          ],
        },
        {
          title: "Examen Clinique",
          fields: [
            { name: "Tension artérielle", type: "text", required: false },
            { name: "Poids (kg)", type: "number", required: false },
            { name: "Taille (cm)", type: "number", required: false },
            { name: "Température (°C)", type: "number", required: false },
          ],
        },
        {
          title: "Observations",
          fields: [
            { name: "Symptômes observés", type: "textarea", required: false },
            { name: "Diagnostic", type: "textarea", required: false },
            { name: "Recommandations", type: "textarea", required: false },
          ],
        },
      ],
    },
    Cree_par: "Dr. Smith",
    created_at: "2024-01-01T10:30:00",
  },
  {
    id: 2,
    name: "Évaluation Psychologique",
    sections_json: {
      sections: [
        {
          title: "État Mental",
          fields: [
            {
              name: "Niveau de stress",
              type: "select",
              required: true,
              options: ["Faible", "Modéré", "Élevé", "Très élevé"],
            },
            {
              name: "Humeur générale",
              type: "select",
              required: true,
              options: ["Excellente", "Bonne", "Moyenne", "Mauvaise"],
            },
            { name: "Troubles du sommeil", type: "checkbox", required: false },
          ],
        },
        {
          title: "Évaluation Cognitive",
          fields: [
            {
              name: "Concentration",
              type: "select",
              required: false,
              options: ["Excellente", "Bonne", "Moyenne", "Faible"],
            },
            {
              name: "Mémoire",
              type: "select",
              required: false,
              options: ["Excellente", "Bonne", "Moyenne", "Faible"],
            },
            { name: "Notes additionnelles", type: "textarea", required: false },
          ],
        },
      ],
    },
    Cree_par: "Dr. Martin",
    created_at: "2024-01-02T14:20:00",
  },
  {
    id: 3,
    name: "Suivi Post-Opératoire",
    sections_json: {
      sections: [
        {
          title: "Détails de l'Intervention",
          fields: [
            { name: "Type d'intervention", type: "text", required: true },
            { name: "Date de l'opération", type: "date", required: true },
            { name: "Chirurgien", type: "text", required: true },
          ],
        },
        {
          title: "État de Guérison",
          fields: [
            {
              name: "Niveau de douleur (1-10)",
              type: "number",
              required: false,
            },
            {
              name: "Cicatrisation",
              type: "select",
              required: false,
              options: ["Excellente", "Bonne", "Moyenne", "Problématique"],
            },
            {
              name: "Mobilité",
              type: "select",
              required: false,
              options: ["Normale", "Limitée", "Très limitée", "Aucune"],
            },
            { name: "Complications", type: "textarea", required: false },
          ],
        },
      ],
    },
    Cree_par: "Dr. Dubois",
    created_at: "2024-01-03T09:15:00",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class DocumentTemplatesService {
  // Get all templates
  static async getAll(): Promise<DocumentTemplate[]> {
    await delay(500);
    return [...mockTemplates];
  }

  // Get template by ID
  static async getById(id: number): Promise<DocumentTemplate | null> {
    await delay(300);
    const template = mockTemplates.find((template) => template.id === id);
    return template || null;
  }

  // Create new template
  static async create(
    data: DocumentTemplateFormData,
  ): Promise<DocumentTemplate> {
    await delay(800);

    const newTemplate: DocumentTemplate = {
      id: Math.max(...mockTemplates.map((template) => template.id)) + 1,
      ...data,
      created_at: new Date().toISOString(),
    };

    mockTemplates.push(newTemplate);
    return newTemplate;
  }

  // Update existing template
  static async update(
    id: number,
    data: DocumentTemplateFormData,
  ): Promise<DocumentTemplate | null> {
    await delay(800);

    const index = mockTemplates.findIndex((template) => template.id === id);
    if (index === -1) return null;

    const updatedTemplate: DocumentTemplate = {
      ...mockTemplates[index],
      ...data,
    };

    mockTemplates[index] = updatedTemplate;
    return updatedTemplate;
  }

  // Delete template
  static async delete(id: number): Promise<boolean> {
    await delay(500);

    const index = mockTemplates.findIndex((template) => template.id === id);
    if (index === -1) return false;

    mockTemplates.splice(index, 1);
    return true;
  }

  // Search templates
  static async search(query: string): Promise<DocumentTemplate[]> {
    await delay(300);

    const lowerQuery = query.toLowerCase();
    return mockTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(lowerQuery) ||
        template.Cree_par.toLowerCase().includes(lowerQuery),
    );
  }
}

// Validation functions
export const validateTemplateData = (
  data: DocumentTemplateFormData,
): string[] => {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push("Le nom du modèle est obligatoire");
  }

  if (!data.Cree_par.trim()) {
    errors.push("Le créateur est obligatoire");
  }

  if (
    !data.sections_json.sections ||
    data.sections_json.sections.length === 0
  ) {
    errors.push("Au moins une section est requise");
  } else {
    data.sections_json.sections.forEach((section, sectionIndex) => {
      if (!section.title.trim()) {
        errors.push(
          `Le titre de la section ${sectionIndex + 1} est obligatoire`,
        );
      }

      if (!section.fields || section.fields.length === 0) {
        errors.push(
          `La section "${section.title}" doit contenir au moins un champ`,
        );
      } else {
        section.fields.forEach((field, fieldIndex) => {
          if (!field.name.trim()) {
            errors.push(
              `Le nom du champ ${fieldIndex + 1} dans "${section.title}" est obligatoire`,
            );
          }

          if (!field.type) {
            errors.push(
              `Le type du champ "${field.name}" dans "${section.title}" est obligatoire`,
            );
          }

          if (
            field.type === "select" &&
            (!field.options || field.options.length === 0)
          ) {
            errors.push(
              `Le champ "${field.name}" de type "select" doit avoir des options`,
            );
          }
        });
      }
    });
  }

  return errors;
};

// Utility functions
export const getAvailableDoctors = (): string[] => {
  return ["Dr. Smith", "Dr. Martin", "Dr. Dubois", "Dr. Laurent"];
};

export const getFieldTypes = (): Array<{ value: string; label: string }> => {
  return [
    { value: "text", label: "Texte" },
    { value: "number", label: "Nombre" },
    { value: "textarea", label: "Zone de texte" },
    { value: "date", label: "Date" },
    { value: "select", label: "Liste déroulante" },
    { value: "checkbox", label: "Case à cocher" },
  ];
};

export const createEmptyTemplate = (): DocumentTemplateFormData => {
  return {
    name: "",
    sections_json: {
      sections: [
        {
          title: "",
          fields: [
            {
              name: "",
              type: "text",
              required: false,
            },
          ],
        },
      ],
    },
    Cree_par: "",
  };
};

export const createEmptySection = (): DocumentSection => {
  return {
    title: "",
    fields: [
      {
        name: "",
        type: "text",
        required: false,
      },
    ],
  };
};

export const createEmptyField = (): DocumentField => {
  return {
    name: "",
    type: "text",
    required: false,
  };
};
