import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="h-5 w-5 text-green-600 dark:text-green-500 shrink-0" />
        ),
        info: (
          <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-500 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="h-5 w-5 text-blue-600 dark:text-blue-500 animate-spin shrink-0" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)"
        }
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:py-3.5 group-[.toaster]:px-4 group-[.toaster]:rounded-xl",
          title: "group-[.toast]:text-[15px] group-[.toast]:font-semibold group-[.toast]:text-foreground",
          description: "group-[.toast]:text-[13px] group-[.toast]:text-muted-foreground group-[.toast]:opacity-90 group-[.toast]:leading-normal break-words",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props} />
  );
}

export { Toaster }
