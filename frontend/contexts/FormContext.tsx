"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

interface FormContextType {
  formState: FormState;
  setFieldValue: (fieldName: string, value: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
  setFieldTouched: (fieldName: string, touched: boolean) => void;
  validateField: (fieldName: string, validator: (value: string) => { isValid: boolean; error?: string }) => boolean;
  resetForm: () => void;
  isFormValid: () => boolean;
  initializeField: (fieldName: string, initialValue?: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [formState, setFormState] = useState<FormState>({});

  const initializeField = (fieldName: string, initialValue: string = "") => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        value: initialValue,
        error: "",
        touched: false,
      },
    }));
  };

  const setFieldValue = (fieldName: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
      },
    }));
  };

  const setFieldError = (fieldName: string, error: string) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
      },
    }));
  };

  const setFieldTouched = (fieldName: string, touched: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched,
      },
    }));
  };

  const validateField = (
    fieldName: string,
    validator: (value: string) => { isValid: boolean; error?: string }
  ): boolean => {
    const field = formState[fieldName];
    if (!field) return false;

    const result = validator(field.value);
    setFieldError(fieldName, result.error || "");
    return result.isValid;
  };

  const resetForm = () => {
    const resetState: FormState = {};
    Object.keys(formState).forEach((key) => {
      resetState[key] = {
        value: "",
        error: "",
        touched: false,
      };
    });
    setFormState(resetState);
  };

  const isFormValid = (): boolean => {
    return Object.values(formState).every(
      (field) => !field.error && field.touched
    );
  };

  return (
    <FormContext.Provider
      value={{
        formState,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        validateField,
        resetForm,
        isFormValid,
        initializeField,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
