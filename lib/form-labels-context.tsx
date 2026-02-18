"use client";

import { createContext, useContext } from "react";

/**
 * Key-value map of form labels from the Storyblok "form-labels" datasource.
 * Keys like "form_name_label", "form_email_placeholder", etc.
 * Values are already resolved for the current locale.
 */
type FormLabels = Record<string, string>;

const FormLabelsContext = createContext<FormLabels>({});

export function FormLabelsProvider({
  labels,
  children,
}: {
  labels: FormLabels;
  children: React.ReactNode;
}) {
  return (
    <FormLabelsContext.Provider value={labels}>
      {children}
    </FormLabelsContext.Provider>
  );
}

/**
 * Hook to access form labels from the datasource.
 * Returns a helper that looks up a key with a fallback.
 */
export function useFormLabels() {
  const labels = useContext(FormLabelsContext);

  function label(key: string, fallback: string = ""): string {
    return labels[key] || fallback;
  }

  return label;
}
