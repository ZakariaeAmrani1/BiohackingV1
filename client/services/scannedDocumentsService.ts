import api from "../api/axios";
import { AuthService } from "./authService";

export interface ScannedDocument {
  id: number;
  title: string;
  description?: string | null;
  filename: string; // original file name
  createdAt: string; // ISO
  CIN: string; // patient CIN
  Cree_par: string; // creator CIN
  file_url?: string; // preview/download URL (mock/runtime)
}

export interface ScannedDocumentFormData {
  title: string;
  description?: string;
  file: File | null;
  CIN: string;
  Cree_par: string;
}

let mockScannedDocs: ScannedDocument[] = [];
let nextId = 1;

const seedIfEmpty = () => {
  if (mockScannedDocs.length > 0) return;
  const now = new Date();
  const base = (mins: number) => new Date(now.getTime() - mins * 60000).toISOString();
  mockScannedDocs = [
    {
      id: nextId++,
      title: "Analyse sanguine (scan)",
      description: "Résultats d'analyse de routine",
      filename: "dummy-1.pdf",
      createdAt: base(1200),
      CIN: "CN898989",
      Cree_par: "BE123456789",
      // Public dummy PDF for preview
      file_url: 
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    },
    {
      id: nextId++,
      title: "Compte rendu radiologie",
      description: "Rapport scanné fourni par le patient",
      filename: "dummy-2.pdf",
      createdAt: base(600),
      CIN: "CN123456",
      Cree_par: "BE987654321",
      file_url: 
        "https://www.orimi.com/pdf-test.pdf",
    },
  ];
};

export class ScannedDocumentsService {
  static async getAll(): Promise<ScannedDocument[]> {
    seedIfEmpty();
    // const result = await api.get(`scanned-documents`);
    // return result.data;
    return [...mockScannedDocs];
  }

  static async getById(id: number): Promise<ScannedDocument | null> {
    seedIfEmpty();
    return mockScannedDocs.find((d) => d.id === id) || null;
  }

  static async getByPatientCIN(cin: string): Promise<ScannedDocument[]> {
    seedIfEmpty();
    return mockScannedDocs.filter((d) => d.CIN === cin);
  }

  static async create(data: ScannedDocumentFormData): Promise<ScannedDocument> {
    seedIfEmpty();
    const currentUser = AuthService.getCurrentUser();
    const now = new Date().toISOString();

    // In real app: upload file to server/storage, backend returns filename/url
    // const form = new FormData();
    // form.append("title", data.title);
    // if (data.description) form.append("description", data.description);
    // form.append("CIN", data.CIN);
    // form.append("Cree_par", currentUser?.CIN || data.Cree_par);
    // if (data.file) form.append("file", data.file);
    // const result = await api.post(`scanned-documents`, form);

    let fileUrl: string | undefined;
    let filename = "fichier.pdf";
    if (data.file) {
      try {
        fileUrl = URL.createObjectURL(data.file);
        filename = data.file.name || filename;
      } catch {
        fileUrl = undefined;
      }
    }

    const newDoc: ScannedDocument = {
      id: nextId++,
      title: data.title,
      description: data.description || null,
      filename,
      createdAt: now,
      CIN: data.CIN,
      Cree_par: currentUser?.CIN || data.Cree_par,
      file_url: fileUrl,
    };

    mockScannedDocs.push(newDoc);
    return newDoc;
  }

  static async update(
    id: number,
    data: Partial<ScannedDocumentFormData>,
  ): Promise<ScannedDocument | null> {
    seedIfEmpty();
    const index = mockScannedDocs.findIndex((d) => d.id === id);
    if (index === -1) return null;

    let fileUrl = mockScannedDocs[index].file_url;
    let filename = mockScannedDocs[index].filename;
    if (data.file) {
      try {
        fileUrl = URL.createObjectURL(data.file);
        filename = data.file.name || filename;
      } catch {}
    }

    const updated: ScannedDocument = {
      ...mockScannedDocs[index],
      title: data.title ?? mockScannedDocs[index].title,
      description: data.description ?? mockScannedDocs[index].description,
      CIN: data.CIN ?? mockScannedDocs[index].CIN,
      Cree_par: mockScannedDocs[index].Cree_par,
      filename,
      file_url: fileUrl,
    };

    mockScannedDocs[index] = updated;
    // await api.patch(`scanned-documents/${id}`, ...) // commented for now
    return updated;
  }

  static async delete(id: number): Promise<boolean> {
    seedIfEmpty();
    // await api.delete(`scanned-documents/${id}`);
    const index = mockScannedDocs.findIndex((d) => d.id === id);
    if (index === -1) return false;
    mockScannedDocs.splice(index, 1);
    return true;
  }

  static async search(query: string, cin?: string): Promise<ScannedDocument[]> {
    seedIfEmpty();
    const q = query.toLowerCase();
    return mockScannedDocs.filter((d) => {
      if (cin && d.CIN !== cin) return false;
      return (
        d.title.toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q) ||
        d.filename.toLowerCase().includes(q) ||
        d.CIN.toLowerCase().includes(q) ||
        d.Cree_par.toLowerCase().includes(q)
      );
    });
  }
}

export const createEmptyScannedDocData = (): ScannedDocumentFormData => {
  const user = AuthService.getCurrentUser();
  return { title: "", description: "", file: null, CIN: "", Cree_par: user?.CIN || "" };
};

export const validateScannedDoc = (data: ScannedDocumentFormData): string[] => {
  const errors: string[] = [];
  if (!data.title.trim()) errors.push("Le titre est obligatoire");
  if (!data.CIN.trim()) errors.push("Le CIN du patient est obligatoire");
  if (!data.file) errors.push("Le fichier PDF est obligatoire");
  return errors;
};
