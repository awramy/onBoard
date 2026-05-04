import { cn } from '@/lib/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarColor, avatarInitials } from '@/lib/avatar';

type UserAvatarProps = {
  username: string;
  imageUrl?: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
};

export function UserAvatar({
  username,
  imageUrl,
  size = 'default',
  className,
}: UserAvatarProps) {
  const colors = avatarColor(username);
  const initials = avatarInitials(username);
  return (
    <Avatar size={size} className={cn(className)}>
      {imageUrl ? <AvatarImage src={imageUrl} alt={username} /> : null}
      <AvatarFallback
        className="font-medium"
        style={{ backgroundColor: colors.bg, color: colors.fg }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
