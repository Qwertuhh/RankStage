
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn, Path } from "react-hook-form";

function EmailComponent<T extends {email: string}>({ form }: { form: UseFormReturn<T> }) {
  return (
    <FormField
      control={form.control}
      name={"email" as Path<T>}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input placeholder="john@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default EmailComponent;

