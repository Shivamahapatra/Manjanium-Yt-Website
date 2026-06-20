import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_customization')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return NextResponse.json(null);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[USER_SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { error } = await supabase
      .from('user_customization')
      .upsert({ 
         clerk_id: userId,
         ...body,
         updated_at: new Date().toISOString()
      }, { onConflict: 'clerk_id' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[USER_SETTINGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
