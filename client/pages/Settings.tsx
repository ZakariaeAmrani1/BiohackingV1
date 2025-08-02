import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Shield,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Check,
  Monitor,
  Sun,
  Moon,
  Type,
  Zap,
  Globe,
  HardDrive,
  DollarSign,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User as UserType,
  UserFormData,
  PasswordChangeData,
  UserService,
} from "@/services/userService";
import { AppSettings, AppSettingsService } from "@/services/appSettingsService";

export default function Settings() {
  const { toast } = useToast();

  // User profile state
  const [user, setUser] = useState<UserType | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    CIN: "",
    nom: "",
    prenom: "",
    date_naissance: "",
    adresse: "",
    numero_telephone: "",
    email: "",
    role: "doctor",
  });
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // App settings state
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: "system",
    fontSize: "medium",
    compactMode: false,
    showAnimations: true,
    language: "fr",
    currency: "DH",
    autoSave: true,
    notifications: {
      desktop: true,
      sound: false,
      email: true,
    },
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");

  // Load data on component mount
  useEffect(() => {
    loadUserProfile();
    loadAppSettings();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await UserService.getCurrentUser();
      setUser(userData);
      setUserFormData({
        CIN: userData.CIN,
        nom: userData.nom,
        prenom: userData.prenom,
        date_naissance: userData.date_naissance.split("T")[0],
        adresse: userData.adresse,
        numero_telephone: userData.numero_telephone,
        email: userData.email,
        role: userData.role,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger le profil utilisateur",
        variant: "destructive",
      });
    }
  };

  const loadAppSettings = async () => {
    try {
      const settings = await AppSettingsService.getSettings();
      setAppSettings(settings);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive",
      });
    }
  };

  const handleUserFormChange = (field: keyof UserFormData, value: string) => {
    setUserFormData((prev) => ({ ...prev, [field]: value }));
    if (profileErrors.length > 0) {
      setProfileErrors([]);
    }
  };

  const handlePasswordChange = (
    field: keyof PasswordChangeData,
    value: string,
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAppSettingChange = async (
    setting: keyof AppSettings,
    value: any,
  ) => {
    try {
      const newSettings = { ...appSettings, [setting]: value };
      setAppSettings(newSettings);
      await AppSettingsService.updateSettings({ [setting]: value });

      toast({
        title: "Paramètre mis à jour",
        description: "Le paramètre a été sauvegardé automatiquement",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = async (
    key: keyof AppSettings["notifications"],
    value: boolean,
  ) => {
    try {
      const newNotifications = { ...appSettings.notifications, [key]: value };
      const newSettings = { ...appSettings, notifications: newNotifications };
      setAppSettings(newSettings);
      await AppSettingsService.updateSettings({
        notifications: newNotifications,
      });

      toast({
        title: "Paramètre de notification mis à jour",
        description: "Le paramètre a été sauvegardé automatiquement",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le paramètre de notification",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    const errors = UserService.validateUserData(userFormData);
    if (errors.length > 0) {
      setProfileErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await UserService.updateProfile(userFormData);
      setUser(updatedUser);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setIsLoading(true);
    try {
      await UserService.changePassword(passwordData);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsPasswordDialogOpen(false);
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le mot de passe",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = async () => {
    setIsLoading(true);
    try {
      const defaultSettings = await AppSettingsService.resetToDefaults();
      setAppSettings(defaultSettings);
      setIsResetDialogOpen(false);
      toast({
        title: "Paramètres réinitialisés",
        description:
          "Tous les paramètres ont été remis à leurs valeurs par défaut",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSettings = async () => {
    try {
      const settingsJson = await AppSettingsService.exportSettings();
      const blob = new Blob([settingsJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "biohacking-clinic-settings.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Paramètres exportés",
        description: "Le fichier de paramètres a été téléchargé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les paramètres",
        variant: "destructive",
      });
    }
  };

  const handleImportSettings = async () => {
    setIsLoading(true);
    try {
      const newSettings = await AppSettingsService.importSettings(importData);
      setAppSettings(newSettings);
      setImportData("");
      setIsImportDialogOpen(false);
      toast({
        title: "Paramètres importés",
        description: "Les paramètres ont été importés avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur d'importation",
        description: error.message || "Impossible d'importer les paramètres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getThemeIcon = (theme: AppSettings["theme"]) => {
    switch (theme) {
      case "light":
        return Sun;
      case "dark":
        return Moon;
      case "system":
        return Monitor;
      default:
        return Monitor;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez votre profil et les paramètres de l'application
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Apparence
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Avancé
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {profileErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="CIN">CIN</Label>
                    <Input
                      id="CIN"
                      value={userFormData.CIN}
                      onChange={(e) =>
                        handleUserFormChange("CIN", e.target.value)
                      }
                      placeholder="Numéro CIN"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Rôle</Label>
                    <Select
                      value={userFormData.role}
                      onValueChange={(value) =>
                        handleUserFormChange("role", value as UserType["role"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UserService.getAvailableRoles().map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prénom</Label>
                    <Input
                      id="prenom"
                      value={userFormData.prenom}
                      onChange={(e) =>
                        handleUserFormChange("prenom", e.target.value)
                      }
                      placeholder="Votre prénom"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom</Label>
                    <Input
                      id="nom"
                      value={userFormData.nom}
                      onChange={(e) =>
                        handleUserFormChange("nom", e.target.value)
                      }
                      placeholder="Votre nom"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_naissance">Date de naissance</Label>
                    <Input
                      id="date_naissance"
                      type="date"
                      value={userFormData.date_naissance}
                      onChange={(e) =>
                        handleUserFormChange("date_naissance", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userFormData.email}
                      onChange={(e) =>
                        handleUserFormChange("email", e.target.value)
                      }
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero_telephone">Téléphone</Label>
                    <Input
                      id="numero_telephone"
                      value={userFormData.numero_telephone}
                      onChange={(e) =>
                        handleUserFormChange("numero_telephone", e.target.value)
                      }
                      placeholder="+32 2 123 45 67"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Textarea
                    id="adresse"
                    value={userFormData.adresse}
                    onChange={(e) =>
                      handleUserFormChange("adresse", e.target.value)
                    }
                    placeholder="Votre adresse complète"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? "Sauvegarde..." : "Sauvegarder le profil"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(true)}
                    className="gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Changer le mot de passe
                  </Button>
                </div>
              </CardContent>
            </Card>

            {user && (
              <Card>
                <CardHeader>
                  <CardTitle>Informations du compte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">ID utilisateur:</span>{" "}
                      {user.id}
                    </div>
                    <div>
                      <span className="font-medium">Rôle:</span>{" "}
                      <Badge variant="secondary">
                        {UserService.getRoleDisplayName(user.role)}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Membre depuis:</span>{" "}
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </div>
                    <div>
                      <span className="font-medium">Nom d'affichage:</span>{" "}
                      {UserService.getDisplayName(user)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Thème et apparence
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Thème</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choisissez l'apparence de l'interface utilisateur
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {AppSettingsService.getThemeOptions().map((option) => {
                        const Icon = getThemeIcon(option.value);
                        return (
                          <div
                            key={option.value}
                            className={`relative rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors ${
                              appSettings.theme === option.value
                                ? "border-primary bg-accent"
                                : "border-border"
                            }`}
                            onClick={() =>
                              handleAppSettingChange("theme", option.value)
                            }
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5" />
                              <div>
                                <div className="font-medium">
                                  {option.label}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                            {appSettings.theme === option.value && (
                              <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">
                      Taille de police
                    </Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ajustez la taille du texte pour améliorer la lisibilité
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {AppSettingsService.getFontSizeOptions().map((option) => (
                        <div
                          key={option.value}
                          className={`relative rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors ${
                            appSettings.fontSize === option.value
                              ? "border-primary bg-accent"
                              : "border-border"
                          }`}
                          onClick={() =>
                            handleAppSettingChange("fontSize", option.value)
                          }
                        >
                          <div className="flex items-center gap-3">
                            <Type className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                          {appSettings.fontSize === option.value && (
                            <Check className="absolute top-2 right-2 h-4 w-4 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Mode compact
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Réduit l'espacement pour afficher plus de contenu
                        </p>
                      </div>
                      <Switch
                        checked={appSettings.compactMode}
                        onCheckedChange={(checked) =>
                          handleAppSettingChange("compactMode", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Animations
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Active les animations et transitions
                        </p>
                      </div>
                      <Switch
                        checked={appSettings.showAnimations}
                        onCheckedChange={(checked) =>
                          handleAppSettingChange("showAnimations", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">
                          Sauvegarde automatique
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Sauvegarde automatiquement vos modifications
                        </p>
                      </div>
                      <Switch
                        checked={appSettings.autoSave}
                        onCheckedChange={(checked) =>
                          handleAppSettingChange("autoSave", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Devise et format
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Devise</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Choisissez la devise utilisée dans l'application
                  </p>
                  <Select
                    value={appSettings.currency}
                    onValueChange={(value) =>
                      handleAppSettingChange("currency", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AppSettingsService.getCurrencyOptions().map(
                        (currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold">
                                {currency.symbol}
                              </span>
                              <span>{currency.label}</span>
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium">Aperçu:</span>
                      <div className="mt-1 space-y-1">
                        <div>
                          Prix:{" "}
                          <span className="font-mono">
                            1 234,56{" "}
                            {AppSettingsService.getCurrentCurrencySymbol()}
                          </span>
                        </div>
                        <div>
                          Total:{" "}
                          <span className="font-mono">
                            15 678,90{" "}
                            {AppSettingsService.getCurrentCurrencySymbol()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Paramètres de notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Notifications bureau
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Affiche des notifications sur votre bureau
                    </p>
                  </div>
                  <Switch
                    checked={appSettings.notifications.desktop}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("desktop", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Sons de notification
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Joue un son lors des notifications
                    </p>
                  </div>
                  <Switch
                    checked={appSettings.notifications.sound}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("sound", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">
                      Notifications email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reçoit des notifications par email
                    </p>
                  </div>
                  <Switch
                    checked={appSettings.notifications.email}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Paramètres avancés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={handleExportSettings}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exporter les paramètres
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsImportDialogOpen(true)}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Importer les paramètres
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setIsResetDialogOpen(true)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Password Change Dialog */}
        <Dialog
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Changer le mot de passe</DialogTitle>
              <DialogDescription>
                Entrez votre mot de passe actuel et choisissez un nouveau mot de
                passe
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      handlePasswordChange("currentPassword", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handlePasswordChange("newPassword", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange("confirmPassword", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button onClick={handleChangePassword} disabled={isLoading}>
                {isLoading ? "Modification..." : "Changer le mot de passe"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Réinitialiser les paramètres</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir réinitialiser tous les paramètres à
                leurs valeurs par défaut ? Cette action ne peut pas être
                annulée.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsResetDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetSettings}
                disabled={isLoading}
              >
                {isLoading ? "R��initialisation..." : "Réinitialiser"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Settings Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Importer les paramètres</DialogTitle>
              <DialogDescription>
                Collez le contenu du fichier de paramètres JSON ci-dessous
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Collez le contenu JSON ici..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsImportDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleImportSettings}
                disabled={isLoading || !importData.trim()}
              >
                {isLoading ? "Importation..." : "Importer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
