import { Webhook } from "svix";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  const body = await req.text();

  const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    const evt = webhook.verify(body, {
      "svix-id": svixId!,
      "svix-timestamp": svixTimestamp!,
      "svix-signature": svixSignature!,
    }) as any;

    if (evt.type === "user.created") {
      const userId = evt.data.id;

      // Create preferences row in Supabase
      const { error } = await supabase
        .from("users_preferences")
        .insert({
          user_id: userId,
          theme: "dark",
          font_size: "md",
          animation_speed: "normal",
          sidebar_expanded: true,
          favorite_teams: [],
          f1_dashboard_preset: "live_focused",
          football_dashboard_preset: "live_matches",
          notifications: {
            email: true,
            push: true,
            alerts: true,
          },
          language: "en",
          timezone: "Asia/Kolkata",
        });

      if (error) {
        console.error("Webhook error creating preferences:", error);
        return new Response("Error creating preferences", { status: 500 });
      }

      console.log(`✓ Preferences created for user ${userId}`);
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (err) {
    console.error("Webhook verification error:", err);
    return new Response("Webhook error", { status: 400 });
  }
}
