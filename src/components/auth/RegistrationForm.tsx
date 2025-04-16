import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SelfieCapture from "./SelfieCapture";
import { uploadDocumentImages } from "@/lib/edgeFunctions";

// Import role-specific form components
import CustomerForm from "./forms/CustomerForm";
import DriverForm from "./forms/DriverForm";
import DriverMitraForm from "./forms/DriverMitraForm";
import StaffForm from "./forms/StaffForm";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    phone: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" }),
    role: z.string().min(1, { message: "Please select a role" }),
    selfieImage: z.string().optional(),
    // Driver fields (common)
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    address: z.string().optional(),
    birthPlace: z.string().optional(),
    birthDate: z.string().optional(),
    religion: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseExpiry: z.string().optional(),
    referencePhone: z.string().optional(),
    ktpImage: z.string().optional(),
    simImage: z.string().optional(),
    // Driver Perusahaan fields
    skckImage: z.string().optional(),
    // Driver Mitra fields (vehicle information)
    color: z.string().optional(),
    license_plate: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional().or(z.string().optional()),
    type: z.string().optional(),
    category: z.string().optional(),
    seats: z.number().optional().or(z.string().optional()),
    transmission: z.string().optional(),
    fuel_type: z.string().optional(),
    // Additional Driver Mitra fields
    kkImage: z.string().optional(),
    stnkImage: z.string().optional(),
    // Staff fields
    department: z.string().optional(),
    position: z.string().optional(),
    employeeId: z.string().optional(),
    idCardImage: z.string().optional(),
  })
  .refine(
    (data) => {
      // If role is Driver, require personal information and license details
      if (data.role === "Driver Mitra" || data.role === "Driver Perusahaan") {
        return (
          !!data.firstName &&
          !!data.lastName &&
          !!data.address &&
          !!data.birthPlace &&
          !!data.birthDate &&
          !!data.religion &&
          !!data.licenseNumber &&
          !!data.licenseExpiry &&
          !!data.referencePhone
        );
      }
      return true;
    },
    {
      message:
        "All personal information and license details are required for drivers",
      path: ["firstName"],
    },
  )
  .refine(
    (data) => {
      // If role is Driver Perusahaan, require SKCK, KK, and STNK
      if (data.role === "Driver Perusahaan") {
        return !!data.skckImage && !!data.kkImage && !!data.stnkImage;
      }
      return true;
    },
    {
      message:
        "SKCK, KK, and STNK documents are required for Driver Perusahaan",
      path: ["skckImage"],
    },
  )
  .refine(
    (data) => {
      // If role is Driver Mitra, require vehicle information
      if (data.role === "Driver Mitra") {
        return (
          !!data.make &&
          !!data.model &&
          !!data.year &&
          !!data.license_plate &&
          !!data.color &&
          !!data.kkImage &&
          !!data.stnkImage
        );
      }
      return true;
    },
    {
      message:
        "Vehicle information, KK, and STNK are required for Driver Mitra",
      path: ["make"],
    },
  )
  .refine(
    (data) => {
      // If role is Staff, require department, position, and employee ID
      if (data.role === "Staff") {
        return !!data.department && !!data.position && !!data.employeeId;
      }
      return true;
    },
    {
      message: "Department, position, and employee ID are required for staff",
      path: ["department"],
    },
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegistrationFormProps {
  onRegister: (data: RegisterFormValues) => void;
  isLoading?: boolean;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  initialRole?: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onRegister,
  isLoading = false,
  showPassword,
  togglePasswordVisibility,
  initialRole,
}) => {
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string>("");
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [selfieRequired, setSelfieRequired] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState({
    selfie: "",
    ktp: "",
    sim: "",
    skck: "",
    kk: "",
    stnk: "",
    idCard: "",
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: initialRole || "Customer",
      selfieImage: "",
      firstName: "",
      lastName: "",
      address: "",
      birthPlace: "",
      birthDate: "",
      religion: "",
      licenseNumber: "",
      licenseExpiry: "",
      referencePhone: "",
      ktpImage: "",
      simImage: "",
      // Driver Perusahaan fields
      skckImage: "",
      // Driver Mitra fields
      color: "",
      license_plate: "",
      make: "",
      model: "",
      year: "",
      type: "",
      category: "",
      seats: "",
      transmission: "",
      fuel_type: "",
      kkImage: "",
      stnkImage: "",
      // Staff fields
      department: "",
      position: "",
      employeeId: "",
      idCardImage: "",
    },
  });

  // Fetch existing user data if userId is available
  useEffect(() => {
    // Set initial role if provided
    if (initialRole) {
      registerForm.setValue("role", initialRole);
    }

    const fetchUserData = async () => {
      // Get userId from localStorage if available (for editing existing user)
      const storedUserId = localStorage.getItem("userId");
      if (storedUserId) {
        setUserId(storedUserId);

        try {
          // Fetch user data
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", storedUserId)
            .single();

          if (userError) throw userError;

          if (userData) {
            // Set selfie URL if available
            if (userData.selfie_url) {
              setExistingImages((prev) => ({
                ...prev,
                selfie: userData.selfie_url,
              }));
              // Set selfie image from existing URL
              setSelfieImage(userData.selfie_url);
              registerForm.setValue("selfieImage", userData.selfie_url);
            }

            // Check role and fetch additional data
            const userRole = localStorage.getItem("userRole");

            if (
              userRole === "Driver Mitra" ||
              userRole === "Driver Perusahaan"
            ) {
              const { data: driverData, error: driverError } = await supabase
                .from("drivers")
                .select("*")
                .eq("id", storedUserId)
                .single();

              if (!driverError && driverData) {
                // Set driver document URLs if available
                if (driverData.ktp_url) {
                  setExistingImages((prev) => ({
                    ...prev,
                    ktp: driverData.ktp_url,
                  }));
                  registerForm.setValue("ktpImage", driverData.ktp_url);
                }
                if (driverData.sim_url) {
                  setExistingImages((prev) => ({
                    ...prev,
                    sim: driverData.sim_url,
                  }));
                  registerForm.setValue("simImage", driverData.sim_url);
                }
                if (driverData.skck_url) {
                  setExistingImages((prev) => ({
                    ...prev,
                    skck: driverData.skck_url,
                  }));
                  registerForm.setValue("skckImage", driverData.skck_url);
                }
                if (driverData.kk_url) {
                  setExistingImages((prev) => ({
                    ...prev,
                    kk: driverData.kk_url,
                  }));
                  registerForm.setValue("kkImage", driverData.kk_url);
                }
                if (driverData.stnk_url) {
                  setExistingImages((prev) => ({
                    ...prev,
                    stnk: driverData.stnk_url,
                  }));
                  registerForm.setValue("stnkImage", driverData.stnk_url);
                }
              }
            } else if (userRole === "Staff") {
              const { data: staffData, error: staffError } = await supabase
                .from("staff")
                .select("*")
                .eq("id", storedUserId)
                .single();

              if (!staffError && staffData) {
                // Set staff document URL if available
                if (staffData.id_card_url) {
                  setExistingImages((prev) => ({
                    ...prev,
                    idCard: staffData.id_card_url,
                  }));
                  registerForm.setValue("idCardImage", staffData.id_card_url);
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [initialRole]);

  const handleRegisterSubmit = async (data: RegisterFormValues) => {
    setRegisterError(null);
    setIsSubmitting(true);

    // Check if selfie is required and not provided
    if (selfieRequired && !selfieImage) {
      setRegisterError("Silakan ambil foto selfie terlebih dahulu");
      setIsSubmitting(false);
      return;
    }

    // Add selfie image to form data
    data.selfieImage = selfieImage;

    // Validate document uploads based on role
    if (data.role === "Driver Mitra" || data.role === "Driver Perusahaan") {
      if (!data.ktpImage) {
        setRegisterError("Please upload your KTP (ID card)");
        setIsSubmitting(false);
        return;
      }
      if (!data.simImage) {
        setRegisterError("Please upload your SIM (Driver's License)");
        setIsSubmitting(false);
        return;
      }
      if (!data.kkImage) {
        setRegisterError("Please upload your KK (Family Card)");
        setIsSubmitting(false);
        return;
      }
      if (!data.stnkImage) {
        setRegisterError("Please upload your STNK (Vehicle Registration)");
        setIsSubmitting(false);
        return;
      }
      // Additional validation for Driver Mitra
      if (data.role === "Driver Mitra") {
        if (!data.make || !data.model || !data.license_plate) {
          setRegisterError("Please complete all vehicle information");
          setIsSubmitting(false);
          return;
        }
      }
      // Additional validation for Driver Perusahaan
      if (data.role === "Driver Perusahaan") {
        if (!data.skckImage) {
          setRegisterError(
            "Please upload your SKCK (Police Clearance Certificate)",
          );
          setIsSubmitting(false);
          return;
        }
      }
    } else if (data.role === "Staff") {
      if (!data.idCardImage) {
        setRegisterError("Please upload your ID Card");
        setIsSubmitting(false);
        return;
      }
      if (!data.department || !data.position || !data.employeeId) {
        setRegisterError("Please complete all staff information");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Call the onRegister callback with the form data
      onRegister(data);
    } catch (error) {
      setRegisterError("An unexpected error occurred");
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...registerForm}>
      <form
        onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
        className="space-y-4"
      >
        <FormField
          control={registerForm.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="John Doe" className="pl-10" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={registerForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="email@example.com"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={registerForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
                    className="pl-10"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={registerForm.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="+1234567890"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={registerForm.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset role-specific fields when role changes
                  if (
                    value !== "Driver Mitra" &&
                    value !== "Driver Perusahaan"
                  ) {
                    registerForm.setValue("firstName", "");
                    registerForm.setValue("lastName", "");
                    registerForm.setValue("address", "");
                    registerForm.setValue("birthPlace", "");
                    registerForm.setValue("birthDate", "");
                    registerForm.setValue("religion", "");
                    registerForm.setValue("licenseNumber", "");
                    registerForm.setValue("licenseExpiry", "");
                    registerForm.setValue("referencePhone", "");
                    registerForm.setValue("ktpImage", "");
                    registerForm.setValue("simImage", "");
                  }
                  if (value !== "Driver Perusahaan") {
                    registerForm.setValue("skckImage", "");
                    // If not Driver Perusahaan or Driver Mitra, clear KK and STNK
                    if (value !== "Driver Mitra") {
                      registerForm.setValue("kkImage", "");
                      registerForm.setValue("stnkImage", "");
                    }
                  }
                  if (value !== "Driver Mitra") {
                    registerForm.setValue("color", "");
                    registerForm.setValue("license_plate", "");
                    registerForm.setValue("make", "");
                    registerForm.setValue("model", "");
                    registerForm.setValue("year", "");
                    registerForm.setValue("type", "");
                    registerForm.setValue("category", "");
                    registerForm.setValue("seats", "");
                    registerForm.setValue("transmission", "");
                    registerForm.setValue("fuel_type", "");
                    registerForm.setValue("kkImage", "");
                    registerForm.setValue("stnkImage", "");
                  }
                  if (value !== "Staff") {
                    registerForm.setValue("department", "");
                    registerForm.setValue("position", "");
                    registerForm.setValue("employeeId", "");
                    registerForm.setValue("idCardImage", "");
                  }
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                  <SelectItem value="Driver Mitra">Driver Mitra</SelectItem>
                  <SelectItem value="Driver Perusahaan">
                    Driver Perusahaan
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Role-specific fields */}
        {registerForm.watch("role") === "Customer" && (
          <CustomerForm control={registerForm.control} />
        )}

        {(registerForm.watch("role") === "Driver Mitra" ||
          registerForm.watch("role") === "Driver Perusahaan") && (
          <DriverForm
            control={registerForm.control}
            watch={registerForm.watch}
            setValue={registerForm.setValue}
            existingImages={existingImages}
          />
        )}

        {/* Driver Mitra specific fields - Vehicle Information */}
        {registerForm.watch("role") === "Driver Mitra" && (
          <DriverMitraForm
            control={registerForm.control}
            watch={registerForm.watch}
            setValue={registerForm.setValue}
          />
        )}

        {registerForm.watch("role") === "Staff" && (
          <StaffForm
            control={registerForm.control}
            watch={registerForm.watch}
            setValue={registerForm.setValue}
            existingImages={existingImages}
          />
        )}

        {/* Selfie Capture Component */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Selfie Verification</FormLabel>
          </div>
          <SelfieCapture
            onCapture={(image) => {
              setSelfieImage(image);
              registerForm.setValue("selfieImage", image);
            }}
            onBlinkDetected={() => setBlinkDetected(true)}
            blinkDetected={blinkDetected}
          />
          {existingImages.selfie && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1">
                Existing Selfie Image:
              </p>
              <img
                src={existingImages.selfie}
                alt="Selfie"
                className="w-full max-h-32 object-contain mb-2 border rounded"
              />
            </div>
          )}
          {!selfieImage && !existingImages.selfie && (
            <p className="text-xs text-muted-foreground">
              Silakan ambil atau upload foto selfie untuk verifikasi
            </p>
          )}
        </div>

        {registerError && (
          <div className="text-sm text-destructive mb-2">{registerError}</div>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={
            isLoading || isSubmitting || (selfieRequired && !selfieImage)
          }
        >
          {isLoading || isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};

export default RegistrationForm;
