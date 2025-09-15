import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/signup-form-schema";
import { z } from "zod";

type FormData = z.infer<typeof formSchema>;

function BioComponent({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <FormField
      control={form.control}
      name="bio"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Tell us a little about yourself"
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormDescription>
            You can write a short bio about yourself.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default BioComponent;
