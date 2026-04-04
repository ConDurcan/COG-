jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { supabase } from "@/lib/supabase";
import { SupportService } from "@/services/support-service";

const singleMock = jest.fn();
const insertMock = jest.fn((payload) => ({
  select: () => ({
    single: singleMock,
  }),
}));
const fromMock = supabase.from as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  fromMock.mockReturnValue({
    insert: insertMock,
  });
});

describe("SupportService.createSupportTicket", () => {
  it("inserts a support ticket and returns the created row", async () => {
    singleMock.mockResolvedValue({
      data: {
        id: 1,
        user_email: "alex@example.com",
        issue_type: "bug",
        issue_description: "The app crashes when I start the workout.",
        created_at: "2026-04-04T10:00:00Z",
      },
      error: null,
    });

    const result = await SupportService.createSupportTicket({
      userEmail: "alex@example.com",
      issueType: "bug",
      issueDescription: "The app crashes when I start the workout.",
    });

    expect(fromMock).toHaveBeenCalledWith("support_tickets");
    expect(insertMock).toHaveBeenCalledWith({
      user_email: "alex@example.com",
      issue_type: "bug",
      issue_description: "The app crashes when I start the workout.",
    });
    expect(result).toEqual({
      id: 1,
      user_email: "alex@example.com",
      issue_type: "bug",
      issue_description: "The app crashes when I start the workout.",
      created_at: "2026-04-04T10:00:00Z",
    });
  });

  it("throws when Supabase returns an error", async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { message: "Insert failed" },
    });

    await expect(
      SupportService.createSupportTicket({
        userEmail: "alex@example.com",
        issueType: "error",
        issueDescription: "Something went wrong.",
      }),
    ).rejects.toThrow("Insert failed");
  });

  it("throws when description is empty", async () => {
    await expect(
      SupportService.createSupportTicket({
        userEmail: "alex@example.com",
        issueType: "bug",
        issueDescription: "   ",
      }),
    ).rejects.toThrow("Please describe the issue before submitting");
  });
});
