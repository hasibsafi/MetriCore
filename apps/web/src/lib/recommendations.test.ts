import { describe, expect, it } from "vitest";
import { buildDeterministicRecommendations } from "@metricore/shared";

describe("buildDeterministicRecommendations", () => {
  it("returns deterministic output for same input", () => {
    const input = {
      pageSpeed: {
        performanceScore: 42,
        lcpMs: 4800,
        cls: 0.2,
        tbtMs: 550
      },
      ga4: {
        sessions: 800,
        users: 620,
        topPages: [
          { path: "/", sessions: 700, users: 550 },
          { path: "/pricing", sessions: 100, users: 70 }
        ]
      },
      previousGa4: {
        sessions: 1200,
        users: 890
      },
      gsc: {
        clicks: 120,
        impressions: 12000,
        ctr: 0.01,
        position: 12,
        topQueries: [{ query: "metricore portal", clicks: 20, impressions: 3000, ctr: 0.006, position: 11 }],
        topPages: [{ page: "https://getmetricore.com/home", clicks: 18, impressions: 2500, ctr: 0.007, position: 10.5 }]
      },
      integration: {
        hasGa4Property: true,
        hasGscSiteUrl: true,
        connected: true
      }
    };

    const first = buildDeterministicRecommendations(input);
    const second = buildDeterministicRecommendations(input);

    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(0);
  });

  it("generates setup recommendations when integrations are missing", () => {
    const recommendations = buildDeterministicRecommendations({
      pageSpeed: null,
      ga4: null,
      previousGa4: null,
      gsc: null,
      integration: {
        connected: false,
        hasGa4Property: false,
        hasGscSiteUrl: false
      }
    });

    const keys = recommendations.map((item) => item.key);

    expect(keys).toContain("integration:connect-google");
    expect(keys).toContain("integration:ga4-property-missing");
    expect(keys).toContain("integration:gsc-site-missing");
    expect(keys).toContain("pagespeed:missing");
    expect(keys).toContain("ga4:missing");
    expect(keys).toContain("gsc:missing");
  });

  it("caps recommendation count and ensures unique keys", () => {
    const recommendations = buildDeterministicRecommendations({
      pageSpeed: {
        performanceScore: 10,
        lcpMs: 7000,
        cls: 0.4,
        tbtMs: 900
      },
      ga4: {
        sessions: 100,
        users: 80,
        topPages: [
          { path: "/", sessions: 95, users: 70 },
          { path: "/blog", sessions: 5, users: 4 }
        ]
      },
      previousGa4: {
        sessions: 250,
        users: 210
      },
      gsc: {
        clicks: 50,
        impressions: 20000,
        ctr: 0.001,
        position: 9,
        topQueries: [{ query: "seo strategy", clicks: 20, impressions: 4000, ctr: 0.005, position: 9.5 }],
        topPages: [{ page: "https://getmetricore.com/services", clicks: 15, impressions: 3500, ctr: 0.004, position: 10 }]
      },
      integration: {
        connected: true,
        hasGa4Property: true,
        hasGscSiteUrl: true
      }
    });

    const keys = recommendations.map((item) => item.key);
    const unique = new Set(keys);

    expect(recommendations.length).toBeLessThanOrEqual(20);
    expect(unique.size).toBe(keys.length);
  });
});
