import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import clientLogger from "@/lib/sdk/client-logger";
import { UseFormReturn, Path } from "react-hook-form";

function OldPasswordComponent<T extends { oldPassword?: string }>({
  form,
}: {
  form: UseFormReturn<T>;
}) {
  const oldPassword = form.watch("oldPassword" as Path<T>);

  // If oldPassword is not present, return null
  clientLogger("warn", "OldPasswordComponent", { oldPassword });
  if (oldPassword === undefined || oldPassword === null) return null;
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name={"oldPassword" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Old Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="••••••••" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export default OldPasswordComponent;
