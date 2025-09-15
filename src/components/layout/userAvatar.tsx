import { cn } from "@/lib/utils";
import { AvatarImage } from "@radix-ui/react-avatar";

function UserAvatar({ preview, alt = "Avatar", className, size = "96px" }: { preview: string; alt?: string; className?: string; size?: string }) {
  return (
    <AvatarImage
      src={preview}
      alt={alt}
      className={cn("object-fill p-1", className)}
      sizes={size}
    />
  );
}
export default UserAvatar;
