"use client";

import { useState } from "react";
import { storyblokEditable } from "@storyblok/react";
import type { ContactFormBlok, FormFieldBlok } from "@/lib/types";

function FormField({ field }: { field: FormFieldBlok }) {
  const id = `form-${field.name}`;
  const inputClass =
    "mt-2 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:outline-none";

  if (field.type === "checkbox") {
    return (
      <div {...storyblokEditable(field)} className="flex items-center gap-3">
        <input
          type="checkbox"
          id={id}
          name={field.name}
          required={field.required}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
    );
  }

  return (
    <div {...storyblokEditable(field)}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={id}
          name={field.name}
          rows={5}
          required={field.required}
          placeholder={field.placeholder || undefined}
          className={`${inputClass} resize-y`}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          name={field.name}
          required={field.required}
          className={inputClass}
          defaultValue=""
        >
          <option value="" disabled>
            {field.placeholder || "Select an option"}
          </option>
          {(field.options || "")
            .split("\n")
            .filter(Boolean)
            .map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
        </select>
      ) : (
        <input
          type={field.type || "text"}
          id={id}
          name={field.name}
          required={field.required}
          placeholder={field.placeholder || undefined}
          className={inputClass}
        />
      )}
    </div>
  );
}

export default function ContactForm({ blok }: { blok: ContactFormBlok }) {
  const [submitted, setSubmitted] = useState(false);
  const fields = blok.fields || [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section {...storyblokEditable(blok)} className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {blok.title && (
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {blok.title}
            </h2>
            {blok.subtitle && <p className="mt-4 text-lg text-gray-600">{blok.subtitle}</p>}
          </div>
        )}

        {submitted ? (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center" role="status">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-green-800">
              {blok.success_title || "Thank you!"}
            </h3>
            <p className="mt-2 text-green-700">
              {blok.success_message || "Your message has been received."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div
                key={field._uid}
                className={field.width === "half" ? "" : "sm:col-span-2"}
              >
                <FormField field={field} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
              >
                {blok.submit_label || "Send Message"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
