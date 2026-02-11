import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error(
                "Middleware Error: Missing Supabase environment variables."
            );
            return NextResponse.json(
                { partial_error: "Missing Supabase configuration" },
                { status: 500 }
            );
        }

        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        });

        await supabase.auth.getUser();
    } catch (error) {
        console.error("Middleware Error:", error);
        // Ensure we at least return the original response if something fails
        // so we don't crash the entire app, unless it's critical
    }

    return response;
}
