import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/signup-form-schema";
import { z } from "zod";
import { Upload, X } from "lucide-react";
import { useState, useRef} from "react";
import UserAvatar from "@/components/layout/userAvatar";
import { Avatar } from "@radix-ui/react-avatar";

type FormData = z.infer<typeof formSchema>;

function NameComponent({ form }: { form: UseFormReturn<FormData> }) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveImage = (onChange: (file: null) => void) => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <FormField
      control={form.control}
      name="avatar"
      render={({ field: { onChange, ...field } }) => (
        <FormItem>
          <FormLabel>Avatar</FormLabel>
          <div className="space-y-4">
            {preview ? (
              <div className="relative w-26 h-26 overflow-hidden">
                <Avatar>
                  <UserAvatar preview={preview} />
                </Avatar>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(onChange)}
                  className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                  aria-label="Remove avatar"
                  title="Remove avatar"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/25">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                multiple={false}
                className="hidden"
                ref={(e) => {
                  // Handle refs from both react-hook-form and our custom ref
                  field.ref(e);
                  if (fileInputRef) {
                    fileInputRef.current = e;
                  }
                }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Convert file to base64 for preview
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPreview(reader.result as string);
                      onChange(file);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </FormControl>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? "Change" : "Upload"} Avatar
              </Button>
              {preview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveImage(onChange)}
                  className="text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
          <FormDescription>
            Upload a <strong>.png</strong>, <strong>.jpg</strong>, or{" "}
            <strong>.jpeg</strong> image.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default NameComponent;
