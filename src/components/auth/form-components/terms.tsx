
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn, Path } from "react-hook-form";

function BioComponent<T extends {acceptTerms: boolean}>({ form }: { form: UseFormReturn<T> }) {
  return (
    <FormField
      control={form.control}
      name={"acceptTerms" as Path<T>}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>Accept terms and conditions</FormLabel>
            <FormDescription>
              You agree to our Terms of Service and Privacy Policy.
            </FormDescription>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default BioComponent;

