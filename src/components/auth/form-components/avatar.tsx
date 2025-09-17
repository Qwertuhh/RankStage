import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/signup-form-schema";
import { z } from "zod";
import CropperComponent from "@/components/comp-554";

type FormData = z.infer<typeof formSchema>;

function NameComponent({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <FormField
      control={form.control}
      name="avatar"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Avatar</FormLabel>
          <CropperComponent
            onCropped={(file) => {
              field.onChange(file);
              // mark field as touched/dirty and trigger validation
              form.setValue("avatar", file, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              form.trigger("avatar");
            }}
            onRemove={() => {
              field.onChange(null);
              form.setValue("avatar", null, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              form.trigger("avatar");
            }}
          />
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
