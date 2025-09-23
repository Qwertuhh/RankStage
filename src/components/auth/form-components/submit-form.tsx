import { UseFormReturn } from "react-hook-form";
import { formSchema } from "@/types/auth/signup-form-schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof formSchema>;

function SubmitForm({ form }: { form: UseFormReturn<FormData> }) {
  return (
    <div className="flex justify-center items-center gap-2 w-full px-4">
      <Button
        type="submit"
        className="w-full cursor-pointer"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Submitting..." : "Create Account"}
      </Button>
    </div>
  );
}

export default SubmitForm;
