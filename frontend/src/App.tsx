import { Toaster } from '@/components/ui/sonner';
import { env } from '@/config/env';
import { UiKitShowcase } from '@/pages/UiKitShowcase';

const showUiKit = import.meta.env.DEV || env.showUiKit;

export default function App() {
  return (
    <>
      {showUiKit ? (
        <UiKitShowcase />
      ) : (
        <div className="flex min-h-dvh items-center justify-center">
          <p className="text-foreground">Hello onBoard</p>
        </div>
      )}
      <Toaster richColors position="top-right" />
    </>
  );
}
