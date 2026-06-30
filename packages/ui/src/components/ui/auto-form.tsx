import React, { useState } from "react";
import { z } from "zod";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Badge } from "./badge";
import { Button } from "./button";
import { Loader2, X } from "lucide-react";

export type FieldConfig = {
  label?: string;
  placeholder?: string;
  type?: "text" | "number" | "password" | "textarea" | "select" | "tags" | "hidden";
  readOnly?: boolean;
  options?: { label: string; value: string; disabled?: boolean }[];
  className?: string;
  renderRightElement?: (value: any, onChange: (val: any) => void) => React.ReactNode;
};

function TagsField({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const next = draft.trim();
    if (next && !value.includes(next)) onChange([...value, next]);
    setDraft("");
  };
  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            {!readOnly && (
              <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))}>
                <X className="size-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>
      {!readOnly && (
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
        />
      )}
    </div>
  );
}

interface AutoFormProps<T extends z.ZodRawShape> {
  schema: z.ZodObject<T>;
  onSubmit: (values: z.infer<z.ZodObject<T>>) => Promise<void> | void;
  fieldConfig?: {
    [K in keyof z.infer<z.ZodObject<T>>]?: FieldConfig;
  };
  defaultValues?: Partial<z.infer<z.ZodObject<T>>>;
  values?: Partial<z.infer<z.ZodObject<T>>>;
  onValuesChange?: (values: z.infer<z.ZodObject<T>>) => void;
  submitText?: string;
  className?: string;
}

export function AutoForm<T extends z.ZodRawShape>({
  schema,
  onSubmit,
  fieldConfig = {},
  defaultValues = {},
  values: propValues,
  onValuesChange,
  submitText = "Submit",
  className = "",
}: AutoFormProps<T>) {
  type FormValues = z.infer<z.ZodObject<T>>;
  
  // Set initial values from defaults or schema shape
  const getInitialValues = (): FormValues => {
    const vals = { ...defaultValues } as any;
    for (const key of Object.keys(schema.shape)) {
      if (vals[key] === undefined) {
        const field = schema.shape[key] as any;
        if (field instanceof z.ZodDefault) {
          vals[key] = (field._def as any).defaultValue();
        } else if (field instanceof z.ZodNumber) {
          vals[key] = 0;
        } else if (field instanceof z.ZodBoolean) {
          vals[key] = false;
        } else if (field instanceof z.ZodArray) {
          vals[key] = [];
        } else {
          vals[key] = "";
        }
      }
    }
    return vals as FormValues;
  };

  const [values, setValues] = useState<FormValues>(getInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Sync controlled values prop if provided
  React.useEffect(() => {
    if (propValues) {
      setValues((prev) => {
        const next = { ...prev } as any;
        let changed = false;
        const pVals = propValues as any;
        for (const key of Object.keys(pVals)) {
          if (next[key] !== pVals[key]) {
            next[key] = pVals[key];
            changed = true;
          }
        }
        return changed ? (next as FormValues) : prev;
      });
    }
  }, [propValues]);

  const validateField = (name: keyof FormValues, value: any) => {
    const fieldSchema = schema.shape[name as string] as any;
    if (!fieldSchema) return;

    let parsedValue = value;
    // Coerce numbers
    if (fieldSchema instanceof z.ZodNumber || (fieldSchema._def && fieldSchema._def.innerType instanceof z.ZodNumber)) {
      const num = Number(value);
      parsedValue = isNaN(num) ? value : num;
    }

    const result = fieldSchema.safeParse(parsedValue);
    if (!result.success) {
      const errMsg = result.error.errors[0]?.message || "Invalid input";
      setErrors((prev) => ({ ...prev, [name]: errMsg }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as string];
        return next;
      });
    }
  };

  const handleChange = (name: keyof FormValues, val: any) => {
    const nextValues = { ...values, [name]: val };
    setValues(nextValues);
    validateField(name, val);
    if (onValuesChange) {
      onValuesChange(nextValues);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Coerce numeric types in final validation
    const coercedValues = { ...values } as any;
    for (const key of Object.keys(schema.shape)) {
      const fieldSchema = schema.shape[key] as any;
      if (
        fieldSchema instanceof z.ZodNumber ||
        (fieldSchema._def && fieldSchema._def.innerType instanceof z.ZodNumber) ||
        (fieldSchema instanceof z.ZodDefault && fieldSchema._def.innerType instanceof z.ZodNumber)
      ) {
        coercedValues[key] = Number((values as any)[key]);
      }
    }

    const result = schema.safeParse(coercedValues);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      for (const err of (result as any).error.errors) {
        const path = err.path[0] as string;
        if (path) {
          newErrors[path] = err.message;
        }
      }
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    try {
      await onSubmit(result.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {Object.keys(schema.shape).map((key) => {
        const name = key as keyof FormValues;
        const config = fieldConfig[name];
        if (config?.type === "hidden") return null;

        const fieldSchema = schema.shape[key];
        const label = config?.label || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
        const placeholder = config?.placeholder || `Enter ${label.toLowerCase()}`;
        const error = errors[key];
        const value = (values as any)[key];

        // Determine control type
        let controlType = config?.type;
        if (!controlType) {
          if (fieldSchema instanceof z.ZodEnum) {
            controlType = "select";
          } else if (fieldSchema instanceof z.ZodNumber) {
            controlType = "number";
          } else if (fieldSchema instanceof z.ZodArray) {
            controlType = "tags";
          } else {
            controlType = "text";
          }
        }

        return (
          <div key={key} className={`space-y-2 ${config?.className || ""}`}>
            <div className="flex items-center justify-between">
              <Label htmlFor={key} className="text-sm font-semibold tracking-wide">
                {label}
              </Label>
            </div>
            
            <div className="flex gap-2 items-center">
              {controlType === "textarea" ? (
                <Textarea
                  id={key}
                  placeholder={placeholder}
                  value={(value as string) || ""}
                  onChange={(e) => handleChange(name, e.target.value)}
                  readOnly={config?.readOnly}
                  className={error ? "border-destructive focus-visible:ring-destructive" : ""}
                />
              ) : controlType === "select" ? (
                <Select
                  value={(value as string) || ""}
                  onValueChange={(val) => handleChange(name, val)}
                  disabled={config?.readOnly}
                >
                  <SelectTrigger
                    id={key}
                    className={`w-full ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  >
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : controlType === "tags" ? (
                <TagsField
                  value={Array.isArray(value) ? value : []}
                  onChange={(v) => handleChange(name, v)}
                  placeholder={placeholder}
                  readOnly={config?.readOnly}
                />
              ) : (
                <Input
                  id={key}
                  type={controlType}
                  placeholder={placeholder}
                  value={value ?? ""}
                  onChange={(e) => {
                    const val = controlType === "number" ? Number(e.target.value) : e.target.value;
                    handleChange(name, val);
                  }}
                  readOnly={config?.readOnly}
                  className={`flex-1 ${config?.readOnly ? "bg-muted cursor-not-allowed" : ""} ${
                    error ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                />
              )}
              {config?.renderRightElement && config.renderRightElement(value, (val) => handleChange(name, val))}
            </div>
            {error && <p className="text-xs font-semibold text-destructive animate-fade-in">{error}</p>}
          </div>
        );
      })}

      <Button type="submit" className="w-full font-bold shadow-lg transition-transform hover:scale-[1.01]" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitting ? "Processing..." : submitText}
      </Button>
    </form>
  );
}
