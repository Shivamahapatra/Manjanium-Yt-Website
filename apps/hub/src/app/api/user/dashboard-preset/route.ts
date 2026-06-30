import { NextResponse } from "next/server";

export async function GET() {
  try {
    // TODO: Verify Clerk authentication
    // const { userId } = auth();
    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // TODO: Fetch from Supabase
    // const { data, error } = await supabase
    //   .from('user_customization')
    //   .select('f1_dashboard_preset, football_dashboard_preset')
    //   .eq('user_id', userId)
    //   .single();
    //
    // if (error) throw error;
    // return NextResponse.json(data);

    // MOCK RESPONSE
    return NextResponse.json({
      f1_dashboard_preset: "live_focused",
      football_dashboard_preset: "live_matches"
    });
  } catch (error) {
    console.error("[DASHBOARD_PRESET_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { f1Preset, footballPreset } = body;

    // TODO: Verify Clerk authentication
    // const { userId } = auth();
    // if (!userId) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // TODO: Save to Supabase
    // const { error } = await supabase
    //   .from('user_customization')
    //   .upsert({ 
    //      user_id: userId, 
    //      ...(f1Preset && { f1_dashboard_preset: f1Preset }),
    //      ...(footballPreset && { football_dashboard_preset: footballPreset })
    //   });
    //
    // if (error) throw error;

    // MOCK SUCCESS
    return NextResponse.json({ success: true, updated: { f1Preset, footballPreset } });
  } catch (error) {
    console.error("[DASHBOARD_PRESET_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
