"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { MessageSquare, Lightbulb, Bug, Palette, Send, CheckCircle2, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type FeedbackType = "feature" | "bug" | "general" | "design";

interface IFormInput {
  feedbackType: FeedbackType;
  subject: string;
  message: string;
  email: string;
}

const RECENT_FEEDBACKS = [
  { id: "FB-1042", type: "feature", subject: "Add driver comparison tool", date: "2026-06-18", status: "Under Review" },
  { id: "FB-0921", type: "bug", subject: "Standings not loading on mobile", date: "2026-06-15", status: "Closed" },
  { id: "FB-0888", type: "design", subject: "Make font larger on stats", date: "2026-06-10", status: "Implemented" },
];

const POPULAR_FEATURES = [
  { id: 1, title: "Dark mode for all pages", votes: 342, icon: <Palette className="w-4 h-4" /> },
  { id: 2, title: "Fantasy Football Integration", votes: 215, icon: <Lightbulb className="w-4 h-4" /> },
  { id: 3, title: "Live race map view", votes: 189, icon: <Lightbulb className="w-4 h-4" /> },
];

export function SuggestionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm<IFormInput>({
    defaultValues: {
      feedbackType: "general"
    }
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setSubmissionId(`FB-${Math.floor(Math.random() * 9000) + 1000}`);
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "feature": return <Lightbulb className="w-4 h-4 text-emerald-400" />;
      case "bug": return <Bug className="w-4 h-4 text-red-400" />;
      case "design": return <Palette className="w-4 h-4 text-purple-400" />;
      default: return <MessageSquare className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Under Review": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "Implemented": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "Closed": return "text-[#94a3b8] bg-white/5 border-white/10";
      default: return "text-white bg-white/10 border-white/20";
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto flex flex-col gap-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Suggestions & Feedback</h2>
        <p className="text-[#94a3b8]">Help us improve Manjanium Sports Hub by sharing your ideas or reporting issues.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Feedback Form */}
        <div className="lg:col-span-3 bg-[#0f172a] p-6 md:p-8 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-lg">Submit Feedback</h3>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">Thank you!</h4>
                <p className="text-[#94a3b8] mb-6 max-w-sm">Your feedback has been submitted successfully. We appreciate your help in making our app better.</p>
                <div className="bg-background/50 px-4 py-2 rounded-lg border border-white/5 font-mono text-sm text-[#94a3b8]">
                  Submission ID: <span className="text-white font-bold">{submissionId}</span>
                </div>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-8 text-sm font-medium text-[#fbbf24] hover:text-[#fbbf24]/80 transition-colors"
                >
                  Submit another response
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Feedback Type</label>
                  <select 
                    {...register("feedbackType")}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition-colors appearance-none"
                  >
                    <option value="general">General Feedback</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="design">Design Suggestion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Brief summary of your feedback"
                    {...register("subject", { required: "Subject is required" })}
                    className={cn(
                      "w-full bg-background border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors",
                      errors.subject ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-[#fbbf24]"
                    )}
                  />
                  {errors.subject && <span className="text-xs text-red-400 mt-1 block">{errors.subject.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Message</label>
                  <textarea 
                    rows={5}
                    placeholder="Please provide as much detail as possible..."
                    {...register("message", { 
                      required: "Message is required",
                      minLength: { value: 20, message: "Message must be at least 20 characters" }
                    })}
                    className={cn(
                      "w-full bg-background border rounded-lg px-4 py-3 text-white focus:outline-none transition-colors resize-none",
                      errors.message ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-[#fbbf24]"
                    )}
                  />
                  {errors.message && <span className="text-xs text-red-400 mt-1 block">{errors.message.message}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-1">Email (Optional)</label>
                  <input 
                    type="email" 
                    placeholder="For follow-up questions"
                    {...register("email")}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#fbbf24] transition-colors"
                  />
                  <p className="text-xs text-[#94a3b8] mt-1">We'll only contact you if we need more information.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-[#fbbf24] text-black hover:bg-[#fbbf24]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-2xl animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar Elements */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Recent Feedback */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h3 className="font-bold text-white text-lg mb-4">Your Recent Feedback</h3>
            <div className="flex flex-col gap-4">
              {RECENT_FEEDBACKS.map(fb => (
                <div key={fb.id} className="p-3 bg-background/50 rounded-xl border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(fb.type)}
                      <span className="text-xs font-mono text-[#94a3b8]">{fb.id}</span>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-2xl border uppercase tracking-wider", getStatusColor(fb.status))}>
                      {fb.status}
                    </span>
                  </div>
                  <div className="text-sm text-white font-medium line-clamp-1">{fb.subject}</div>
                  <div className="text-xs text-[#94a3b8] mt-1">{fb.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Requests */}
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h3 className="font-bold text-white text-lg mb-4">Popular Requests</h3>
            <div className="flex flex-col gap-3">
              {POPULAR_FEATURES.map(feature => (
                <div key={feature.id} className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-white/5 group hover:border-[#fbbf24]/50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center justify-center p-2 bg-white/5 rounded-lg group-hover:bg-[#fbbf24]/10 transition-colors">
                    <ChevronUp className="w-4 h-4 text-[#fbbf24]" />
                    <span className="text-xs font-bold text-white mt-1">{feature.votes}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {feature.icon}
                      <span className="text-sm font-semibold text-white group-hover:text-[#fbbf24] transition-colors">{feature.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              View All Feature Requests
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
