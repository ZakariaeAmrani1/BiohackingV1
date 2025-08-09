export interface Entreprise {
  id: number;
  ICE: number;
  CNSS: number;
  RC: number;
  IF: number;
  RIB: number;
  patente: number;
  adresse: string;
  created_at: string;
}

export interface EntrepriseFormData {
  ICE: number | string;
  CNSS: number | string;
  RC: number | string;
  IF: number | string;
  RIB: number | string;
  patente: number | string;
  adresse: string;
}

// Mock company data
let currentEntreprise: Entreprise | null = {
  id: 1,
  ICE: 123456789,
  CNSS: 987654321,
  RC: 456789123,
  IF: 789123456,
  RIB: 321654987,
  patente: 654987321,
  adresse: "123 Avenue Mohamed V, Casablanca, 20000",
  created_at: "2023-01-01T10:00:00",
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class EntrepriseService {
  // Get company information
  static async getEntreprise(): Promise<Entreprise | null> {
    await delay(300);
    return currentEntreprise;
  }

  // Update company information
  static async updateEntreprise(data: EntrepriseFormData): Promise<Entreprise> {
    await delay(800);

    // Convert string numbers to integers for validation
    const numericData = {
      ICE: typeof data.ICE === 'string' ? parseInt(data.ICE) : data.ICE,
      CNSS: typeof data.CNSS === 'string' ? parseInt(data.CNSS) : data.CNSS,
      RC: typeof data.RC === 'string' ? parseInt(data.RC) : data.RC,
      IF: typeof data.IF === 'string' ? parseInt(data.IF) : data.IF,
      RIB: typeof data.RIB === 'string' ? parseInt(data.RIB) : data.RIB,
      patente: typeof data.patente === 'string' ? parseInt(data.patente) : data.patente,
      adresse: data.adresse,
    };

    const updatedEntreprise: Entreprise = {
      ...currentEntreprise!,
      ...numericData,
    };

    currentEntreprise = updatedEntreprise;

    return updatedEntreprise;
  }

  // Create new company information
  static async createEntreprise(data: EntrepriseFormData): Promise<Entreprise> {
    await delay(800);

    // Convert string numbers to integers
    const numericData = {
      ICE: typeof data.ICE === 'string' ? parseInt(data.ICE) : data.ICE,
      CNSS: typeof data.CNSS === 'string' ? parseInt(data.CNSS) : data.CNSS,
      RC: typeof data.RC === 'string' ? parseInt(data.RC) : data.RC,
      IF: typeof data.IF === 'string' ? parseInt(data.IF) : data.IF,
      RIB: typeof data.RIB === 'string' ? parseInt(data.RIB) : data.RIB,
      patente: typeof data.patente === 'string' ? parseInt(data.patente) : data.patente,
      adresse: data.adresse,
    };

    const newEntreprise: Entreprise = {
      id: 1,
      ...numericData,
      created_at: new Date().toISOString(),
    };

    currentEntreprise = newEntreprise;

    return newEntreprise;
  }

  // Validate company form data
  static validateEntrepriseData(data: EntrepriseFormData): string[] {
    const errors: string[] = [];

    // Convert to numbers for validation
    const ice = typeof data.ICE === 'string' ? parseInt(data.ICE) : data.ICE;
    const cnss = typeof data.CNSS === 'string' ? parseInt(data.CNSS) : data.CNSS;
    const rc = typeof data.RC === 'string' ? parseInt(data.RC) : data.RC;
    const ifNumber = typeof data.IF === 'string' ? parseInt(data.IF) : data.IF;
    const rib = typeof data.RIB === 'string' ? parseInt(data.RIB) : data.RIB;
    const patente = typeof data.patente === 'string' ? parseInt(data.patente) : data.patente;

    if (!data.ICE || isNaN(ice) || ice <= 0) {
      errors.push("L'ICE est obligatoire et doit être un nombre valide");
    }

    if (!data.CNSS || isNaN(cnss) || cnss <= 0) {
      errors.push("Le CNSS est obligatoire et doit être un nombre valide");
    }

    if (!data.RC || isNaN(rc) || rc <= 0) {
      errors.push("Le RC est obligatoire et doit être un nombre valide");
    }

    if (!data.IF || isNaN(ifNumber) || ifNumber <= 0) {
      errors.push("L'IF est obligatoire et doit être un nombre valide");
    }

    if (!data.RIB || isNaN(rib) || rib <= 0) {
      errors.push("Le RIB est obligatoire et doit être un nombre valide");
    }

    if (!data.patente || isNaN(patente) || patente <= 0) {
      errors.push("La patente est obligatoire et doit être un nombre valide");
    }

    if (!data.adresse.trim()) {
      errors.push("L'adresse est obligatoire");
    }

    return errors;
  }

  // Save or update company information
  static async saveEntreprise(data: EntrepriseFormData): Promise<Entreprise> {
    if (currentEntreprise) {
      return this.updateEntreprise(data);
    } else {
      return this.createEntreprise(data);
    }
  }
}
