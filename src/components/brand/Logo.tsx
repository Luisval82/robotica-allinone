import { HubIcon } from "@/components/brand/Hub";

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <HubIcon className="size-9 shrink-0" />
      <span className="font-display text-lg font-semibold leading-none tracking-wide text-ink-900 sm:text-xl">
        ROBOTICA <span className="text-spike-600">ALLINONE</span>
      </span>
    </span>
  );
}
