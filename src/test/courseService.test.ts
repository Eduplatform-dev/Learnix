import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCourses } from "../app/services/courseService";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockClear();
  localStorage.setItem("token", "fake-token");
});

const RAW_COURSE = {
  _id: "course1",
  title: "React Fundamentals",
  instructor: { _id: "i1", username: "Dr Smith", email: "s@s.com" },
  duration: "6 weeks",
  enrolledStudents: ["s1", "s2"],
  rating: 4.8,
  progress: 60,
  status: "active",
  image: "",
};

describe("getCourses", () => {
  it("maps paginated response correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok:   true,
      json: () => Promise.resolve({ courses: [RAW_COURSE], total: 1, page: 1, pages: 1 }),
    } as Response);

    const courses = await getCourses();
    expect(courses).toHaveLength(1);
    expect(courses[0]._id).toBe("course1");
    expect(courses[0].instructor).toBe("Dr Smith");   // username extracted
    expect(courses[0].students).toBe(2);               // enrolledStudents.length
  });

  it("maps plain array response correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok:   true,
      json: () => Promise.resolve([RAW_COURSE]),
    } as Response);

    const courses = await getCourses();
    expect(courses[0].rating).toBe(4.8);
  });

  it("throws on network error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) } as Response);
    await expect(getCourses()).rejects.toThrow();
  });

  it("sends Authorization header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok:   true,
      json: () => Promise.resolve([]),
    } as Response);

    await getCourses();
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((opts.headers as Record<string, string>).Authorization).toBe("Bearer fake-token");
  });
});
