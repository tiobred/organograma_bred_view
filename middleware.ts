import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    // Update session
    const response = await updateSession(request);

    // Note: Admin route protection temporarily disabled
    // Uncomment below when authentication is implemented

    /*
    if (request.nextUrl.pathname.startsWith("/admin")) {
        const supabase = await import("@/lib/supabase/server").then((m) =>
            m.createClient()
        );
        const serverSupabase = await supabase;
        const {
            data: { user },
        } = await serverSupabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Check if user has admin role
        const { data: profile } = await serverSupabase
            .from("profiles")
            .select("metadata")
            .eq("user_id", user.id)
            .single();

        const role = (profile?.metadata as any)?.role;
        if (role !== "admin" && role !== "editor") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }
    */

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
