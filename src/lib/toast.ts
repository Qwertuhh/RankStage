import { toast } from "sonner";
import Logger from "@/lib/logger";

interface ToastOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export const showToast = {
  success: (title: string, options?: ToastOptions) => {
    Logger.info(title, { context: options || {} });
    toast.success(title, options);
  },
  error: (title: string, error?: Error, options?: ToastOptions) => {
    Logger.error(title, error, { context: options || {} });
    toast.error(title, {
      ...options,
      description: options?.description || error?.message,
    });
  },
  warning: (title: string, options?: ToastOptions) => {
    Logger.warn(title, undefined, { context: options || {} });
    toast.warning(title, options);
  },
  info: (title: string, options?: ToastOptions) => {
    Logger.info(title, { context: options || {} });
    toast.info(title, options);
  },
  promise: <T>(
    promise: Promise<T>,
    {
      loading = "Loading...",
      success = "Success!",
      error = "Something went wrong",
    }: {
      loading?: string;
      success?: string | ((data: T) => string);
      error?: string | ((error: Error) => string);
    }
  ): void => {
    toast.promise(promise, {
      loading,
      success: (data: T) => {
        const message = typeof success === "function" ? success(data) : success;
        Logger.info(message, { context: { data } });
        return message;
      },
      error: (err: Error) => {
        const message = typeof error === "function" ? error(err) : error;
        Logger.error(message, err);
        return message;
      },
    });
  },
};
