import React from "react";
import { Control, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { RegisterFormValues } from "../RegistrationForm";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface StaffFormProps {
  control: Control<RegisterFormValues>;
  watch: UseFormWatch<RegisterFormValues>;
  setValue: UseFormSetValue<RegisterFormValues>;
  existingImages: {
    idCard: string;
  };
}

const StaffForm: React.FC<StaffFormProps> = ({
  control,
  watch,
  setValue,
  existingImages,
}) => {
  return (
    <div className="space-y-4 border p-4 rounded-md bg-muted/30">
      <h3 className="font-medium">Staff Information</h3>

      <FormField
        control={control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl>
              <Input placeholder="Enter department" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl>
              <Input placeholder="Enter position" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="employeeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Employee ID</FormLabel>
            <FormControl>
              <Input placeholder="Enter employee ID" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <FormLabel>ID Card Image</FormLabel>
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            id="idcard-upload"
            className="cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const imageData = event.target?.result as string;
                  if (imageData) {
                    setValue("idCardImage", imageData);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
        {existingImages.idCard && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">
              Existing ID Card Image:
            </p>
            <img
              src={existingImages.idCard}
              alt="ID Card"
              className="w-full max-h-32 object-contain mb-2 border rounded"
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Upload a photo of your ID Card - Required for staff registration
        </p>
      </div>
    </div>
  );
};

export default StaffForm;
