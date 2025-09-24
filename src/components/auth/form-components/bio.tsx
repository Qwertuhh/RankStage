import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn, Path } from "react-hook-form";

function BioComponent<T extends {bio: string}>({ form }: { form: UseFormReturn<T> }) {
  return (
    <FormField
      control={form.control}
      name={"bio" as Path<T>}
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
