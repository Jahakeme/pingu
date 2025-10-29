"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "@/contexts/FormContext";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
  validateGender,
} from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Signup = () => {
  const router = useRouter();
  const {
    formState,
    setFieldValue,
    setFieldTouched,
    validateField,
    resetForm,
  } = useForm();

  const [submitError, setSubmitError] = useState<string>("");

  const signupMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      gender: string;
    }) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create account");
      }

      return response.json();
    },
    onSuccess: () => {
      resetForm();
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    },
    onError: (error: Error) => {
      setSubmitError(error.message);
    },
  });

  const handleInputChange = (fieldName: string, value: string) => {
    setFieldValue(fieldName, value);
    setFieldTouched(fieldName, true);

    // Validate on change
    switch (fieldName) {
      case "name":
        validateField(fieldName, validateName);
        break;
      case "email":
        validateField(fieldName, validateEmail);
        break;
      case "password":
        validateField(fieldName, validatePassword);
        // Re-validate confirm password if it's already touched
        if (formState.confirmPassword?.touched) {
          validateField("confirmPassword", (val) =>
            validateConfirmPassword(value, val)
          );
        }
        break;
      case "confirmPassword":
        validateField(fieldName, (val) =>
          validateConfirmPassword(formState.password?.value || "", val)
        );
        break;
      case "gender":
        validateField(fieldName, validateGender);
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    // Validate all fields
    const isNameValid = validateField("name", validateName);
    const isEmailValid = validateField("email", validateEmail);
    const isPasswordValid = validateField("password", validatePassword);
    const isConfirmPasswordValid = validateField(
      "confirmPassword",
      (val) => validateConfirmPassword(formState.password?.value || "", val)
    );
    const isGenderValid = validateField("gender", validateGender);

    if (
      !isNameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isGenderValid
    ) {
      setSubmitError("Please fix all validation errors before submitting");
      return;
    }

    signupMutation.mutate({
      name: formState.name?.value || "",
      email: formState.email?.value || "",
      password: formState.password?.value || "",
      gender: formState.gender?.value || "",
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-8 relative bg-[url('/signup-page.jpg')] bg-cover bg-center">
      {/* Success Message */}
      {signupMutation.isSuccess && (
        <div className="absolute top-4 right-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded w-80">
          Account created successfully! Redirecting to sign in...
        </div>
      )}

      {/* Error Message */}
      {(submitError || signupMutation.error) && (
        <div className="absolute top-4 right-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded w-80">
          {submitError || signupMutation.error?.message}
        </div>
      )}

      <Card className="form-container">
        <CardHeader>
          <CardTitle className="form-title text-center">Sign Up</CardTitle>
          <CardDescription className="form-description text-center">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={formState.name?.value || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
              />
              {formState.name?.touched && formState.name?.error && (
                <p className="text-red-600 text-sm">{formState.name.error}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={formState.email?.value || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter your email"
              />
              {formState.email?.touched && formState.email?.error && (
                <p className="text-red-600 text-sm">{formState.email.error}</p>
              )}
            </div>

            {/* Gender Field */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formState.gender?.value || ""}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
              {formState.gender?.touched && formState.gender?.error && (
                <p className="text-red-600 text-sm">{formState.gender.error}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                value={formState.password?.value || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Enter your password"
              />
              {formState.password?.touched && formState.password?.error && (
                <p className="text-red-600 text-sm">
                  {formState.password.error}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                value={formState.confirmPassword?.value || ""}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="Confirm your password"
              />
              {formState.confirmPassword?.touched &&
                formState.confirmPassword?.error && (
                  <p className="text-red-600 text-sm">
                    {formState.confirmPassword.error}
                  </p>
                )}
            </div>

            <Button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full"
            >
              {signupMutation.isPending ? "Creating Account..." : "Sign Up"}
            </Button>

            <p className="text-sm text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <a href="/signin" className="text-blue-500 hover:underline">
                Sign In
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
