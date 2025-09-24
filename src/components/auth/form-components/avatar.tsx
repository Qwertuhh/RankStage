import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { UseFormReturn, Path } from "react-hook-form";
import CropperComponent from "@/components/imageCropper";

import { PathValue } from "react-hook-form";
import { FileWithPath } from "react-dropzone";

function AvatarComponent<T extends {avatar: File | null}>({ form }: { form: UseFormReturn<T> }) {
  return (
    <FormField
      control={form.control}
      name={"avatar" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Avatar</FormLabel>
          <CropperComponent
            onCropped={(file: FileWithPath) => {
              field.onChange(file);
              // mark field as touched/dirty and trigger validation
              form.setValue("avatar" as Path<T>, file as unknown as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              form.trigger("avatar" as Path<T>);
            }}
            onRemove={() => {
              field.onChange(null);
              form.setValue("avatar" as Path<T>, null as unknown as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
              form.trigger("avatar" as Path<T>);
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

export default AvatarComponent;
