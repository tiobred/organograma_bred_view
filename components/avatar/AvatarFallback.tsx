import { getInitials, stringToColor } from "@/lib/utils";

interface AvatarFallbackProps {
    name: string;
    size?: number;
    className?: string;
}

export function AvatarFallback({ name, size = 40, className = "" }: AvatarFallbackProps) {
    const initials = getInitials(name);
    const backgroundColor = stringToColor(name);

    return (
        <div
            className={`flex items-center justify-center rounded-full font-semibold text-white ${className}`}
            style={{
                width: size,
                height: size,
                background: `linear-gradient(135deg, ${backgroundColor} 0%, ${adjustBrightness(backgroundColor, -20)} 100%)`,
                fontSize: size * 0.4,
            }}
        >
            {initials}
        </div>
    );
}

/**
 * Adjust HSL color brightness
 */
function adjustBrightness(hsl: string, amount: number): string {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return hsl;

    const [, h, s, l] = match;
    const newL = Math.max(0, Math.min(100, parseInt(l) + amount));
    return `hsl(${h}, ${s}%, ${newL}%)`;
}
