import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 shadow-inner">
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-[#0ea5e9] to-[#fbbf24]">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-[#94a3b8] text-sm text-center">Sign in to access your customized sports dashboard.</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
