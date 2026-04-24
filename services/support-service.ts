import { supabase } from "@/lib/supabase";

export interface SupportTicketInput {
  userEmail: string;
  issueType: string;
  issueDescription: string;
}

export interface SupportTicket {
  id: number;
  user_email: string;
  issue_type: string;
  issue_description: string;
  created_at: string;
}

export const SupportService = {
  async createSupportTicket(input: SupportTicketInput): Promise<SupportTicket> {
    if (!input.userEmail) {
      throw new Error("Unable to create support ticket without user email");
    }

    if (!input.issueType) {
      throw new Error("Please select an issue type");
    }

    if (!input.issueDescription?.trim()) {
      throw new Error("Please describe the issue before submitting");
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_email: input.userEmail,
        issue_type: input.issueType,
        issue_description: input.issueDescription.trim(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Failed to create support ticket");
    }

    return data as SupportTicket;
  },
};
