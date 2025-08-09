import { User } from "./userService";

import api from "../api/axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  CIN: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  adresse: string;
  numero_telephone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: User["role"];
}

export interface AuthUser extends Omit<User, "password"> {
  token: string;
}

// Mock users for authentication
const mockUsers: (User & { password: string })[] = [
  {
    id: 1,
    CIN: "BE123456789",
    nom: "Smith",
    prenom: "Dr. John",
    date_naissance: "1980-05-15T00:00:00",
    adresse: "123 Avenue de la Santé, Bruxelles, 1000",
    numero_telephone: "+32 2 123 45 67",
    email: "admin@biohacking-clinic.be",
    password: "admin123",
    role: "admin",
    created_at: "2023-01-01T10:00:00",
  },
  {
    id: 2,
    CIN: "BE987654321",
    nom: "Martin",
    prenom: "Dr. Sarah",
    date_naissance: "1985-03-20T00:00:00",
    adresse: "456 Rue des Médecins, Liège, 4000",
    numero_telephone: "+32 4 987 65 43",
    email: "doctor@biohacking-clinic.be",
    password: "doctor123",
    role: "doctor",
    created_at: "2023-01-01T10:00:00",
  },
];

// Storage keys
const TOKEN_KEY = "biohacking-clinic-token";
const USER_KEY = "biohacking-clinic-user";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AuthService {
  // Generate a simple JWT-like token
  private static generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    return btoa(JSON.stringify(payload));
  }

  // Decode token
  private static decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }

  // Check if token is valid
  private static isTokenValid(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    return Date.now() < decoded.exp;
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const result = await api.post("auth/login", credentials);
      const data = result.data;
      const authUser: AuthUser = {
        id: data.user.id,
        CIN: data.user.CIN,
        nom: data.user.nom,
        prenom: data.user.prenom,
        date_naissance: data.user.date_naissance,
        adresse: data.user.adresse,
        numero_telephone: data.user.numero_telephone,
        email: data.user.email,
        role: data.user.role,
        created_at: data.user.created_at,
        token: data.token,
      };

      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));

      return authUser;
    } catch (error) {
      throw new Error("Email ou mot de passe est incorrect");
    }
  }

  // Register new user
  static async register(input: RegisterData): Promise<AuthUser> {
    // Validate registration data
    const errors = this.validateRegistrationData(input);
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    try {
      const result = await api.post("auth/register", input);
      const data = result.data;
      const authUser: AuthUser = {
        id: data.user.id,
        CIN: data.user.CIN,
        nom: data.user.nom,
        prenom: data.user.prenom,
        date_naissance: data.user.date_naissance,
        adresse: data.user.adresse,
        numero_telephone: data.user.numero_telephone,
        email: data.user.email,
        role: data.user.role,
        created_at: data.user.created_at,
        token: data.token,
      };

      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));

      return authUser;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Get current user from localStorage
  static getCurrentUser(): AuthUser | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (!token || !userStr) return null;

      if (!this.isTokenValid(token)) {
        this.logout();
        return null;
      }

      return JSON.parse(userStr);
    } catch {
      this.logout();
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? this.isTokenValid(token) : false;
  }

  // Refresh token (simulate token refresh)
  static async refreshToken(): Promise<AuthUser | null> {
    await delay(300);

    const currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    const newToken = this.generateToken(currentUser);
    const updatedUser = { ...currentUser, token: newToken };

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  }

  // Validate registration data
  static validateRegistrationData(data: RegisterData): string[] {
    const errors: string[] = [];

    if (!data.CIN.trim()) {
      errors.push("Le CIN est obligatoire");
    }

    if (!data.nom.trim()) {
      errors.push("Le nom est obligatoire");
    }

    if (!data.prenom.trim()) {
      errors.push("Le prénom est obligatoire");
    }

    if (!data.date_naissance) {
      errors.push("La date de naissance est obligatoire");
    }

    if (!data.adresse.trim()) {
      errors.push("L'adresse est obligatoire");
    }

    if (!data.numero_telephone.trim()) {
      errors.push("Le numéro de téléphone est obligatoire");
    }

    if (!data.email.trim()) {
      errors.push("L'email est obligatoire");
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.push("L'email n'est pas valide");
    }

    if (!data.password) {
      errors.push("Le mot de passe est obligatoire");
    } else if (data.password.length < 6) {
      errors.push("Le mot de passe doit contenir au moins 6 caractères");
    }

    if (data.password !== data.confirmPassword) {
      errors.push("Les mots de passe ne correspondent pas");
    }

    return errors;
  }

  // Get default login credentials for demo
  static getDefaultCredentials(): {
    admin: LoginCredentials;
    doctor: LoginCredentials;
  } {
    return {
      admin: {
        email: "admin@biohacking-clinic.be",
        password: "admin123",
      },
      doctor: {
        email: "doctor@biohacking-clinic.be",
        password: "doctor123",
      },
    };
  }
}
