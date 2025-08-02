export interface User {
  id: number;
  CIN: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  adresse: string;
  numero_telephone: string;
  email: string;
  password?: string; // Optional for security
  role: "admin" | "doctor" | "nurse" | "receptionist";
  created_at: string;
}

export interface UserFormData {
  CIN: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  adresse: string;
  numero_telephone: string;
  email: string;
  role: User["role"];
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Mock current user data
let currentUser: User = {
  id: 1,
  CIN: "BE123456789",
  nom: "Smith",
  prenom: "Dr. John",
  date_naissance: "1980-05-15T00:00:00",
  adresse: "123 Avenue de la Santé, Bruxelles, 1000",
  numero_telephone: "+32 2 123 45 67",
  email: "dr.smith@biohacking-clinic.be",
  role: "admin",
  created_at: "2023-01-01T10:00:00",
};

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class UserService {
  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    await delay(300);
    // Return user without password for security
    const { password, ...userWithoutPassword } = currentUser;
    return userWithoutPassword as User;
  }

  // Update user profile
  static async updateProfile(data: UserFormData): Promise<User> {
    await delay(800);

    const updatedUser: User = {
      ...currentUser,
      ...data,
    };

    currentUser = updatedUser;

    // Return user without password
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  // Change password
  static async changePassword(data: PasswordChangeData): Promise<boolean> {
    await delay(800);

    // In a real app, you'd verify the current password against the hash
    // For demo purposes, we'll just validate the format
    if (data.newPassword !== data.confirmPassword) {
      throw new Error("Les mots de passe ne correspondent pas");
    }

    if (data.newPassword.length < 8) {
      throw new Error("Le mot de passe doit contenir au moins 8 caractères");
    }

    // In real app, you'd hash the password before storing
    currentUser.password = data.newPassword;

    return true;
  }

  // Validate user form data
  static validateUserData(data: UserFormData): string[] {
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

    return errors;
  }

  // Get available roles
  static getAvailableRoles(): { value: User["role"]; label: string }[] {
    return [
      { value: "admin", label: "Administrateur" },
      { value: "doctor", label: "Médecin" },
      { value: "nurse", label: "Infirmier/ère" },
      { value: "receptionist", label: "Réceptionniste" },
    ];
  }

  // Format user display name
  static getDisplayName(user: User): string {
    return `${user.prenom} ${user.nom}`;
  }

  // Get role display name
  static getRoleDisplayName(role: User["role"]): string {
    const roles = this.getAvailableRoles();
    return roles.find((r) => r.value === role)?.label || role;
  }
}
