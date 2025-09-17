import { cn } from "@/lib/utils";
import { AvatarImage } from "@radix-ui/react-avatar";

function UserAvatar({ preview, alt = "Avatar", className, size = "24" }: { preview: string; alt?: string; className?: string; size?: string }) {
  return (
    <AvatarImage
      src={preview}
      alt={alt}
      className={cn("object-fill p-1 rounded-full border dark:border-gray-800", className)
      }
      sizes={size}
    />
  );
}
export default UserAvatar;
