// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Stat } from "@/components/ui/Stat";
import { Alert } from "@/components/ui/Alert";
import { Progress } from "@/components/ui/Progress";
import { Pill } from "@/components/ui/Pill";

describe("Button", () => {
  it("defaults to the primary (blue=action) variant", () => {
    render(<Button>Save changes</Button>);
    const btn = screen.getByRole("button", { name: "Save changes" });
    expect(btn).toHaveClass("bs-btn", "bs-btn-primary");
    expect(btn).toHaveAttribute("type", "button");
  });

  it("applies the requested variant and merges className", () => {
    render(<Button variant="outline" className="w-full">Cancel</Button>);
    const btn = screen.getByRole("button", { name: "Cancel" });
    expect(btn).toHaveClass("bs-btn-outline", "w-full");
    expect(btn).not.toHaveClass("bs-btn-primary");
  });
});

describe("Badge", () => {
  it("maps tone to the token class; warning aliases hi-vis", () => {
    const { rerender } = render(<Badge tone="success">Ready</Badge>);
    expect(screen.getByText("Ready")).toHaveClass("bs-badge", "bs-badge-success");
    rerender(<Badge tone="warning">Check</Badge>);
    expect(screen.getByText("Check")).toHaveClass("bs-badge-hivis");
  });
});

describe("Card", () => {
  it("adds the blueprint grid only when requested", () => {
    const { rerender } = render(<Card>plain</Card>);
    expect(screen.getByText("plain")).not.toHaveClass("bs-blueprint-grid");
    rerender(<Card blueprint>grid</Card>);
    expect(screen.getByText("grid")).toHaveClass("bs-metric-card", "bs-blueprint-grid");
  });
});

describe("Stat", () => {
  it("renders label, mono value and annotation hint", () => {
    render(<Stat label="Readiness" value="87%" hint="42,800 SF" />);
    expect(screen.getByText("Readiness")).toHaveClass("bs-metric-label");
    expect(screen.getByText("87%")).toHaveClass("bs-num");
    expect(screen.getByText("42,800 SF")).toHaveClass("bs-annotation");
  });
});

describe("Alert", () => {
  it("renders the redline gap-caught variant", () => {
    render(<Alert tone="redline">2 addenda not confirmed</Alert>);
    expect(screen.getByText("2 addenda not confirmed").closest(".bs-redline")).toBeInTheDocument();
  });
});

describe("Progress", () => {
  it("clamps value and exposes progressbar a11y attributes", () => {
    render(<Progress value={150} aria-label="readiness" />);
    const bar = screen.getByRole("progressbar", { name: "readiness" });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("uses readiness-aware color by value", () => {
    const { container } = render(<Progress value={20} />);
    const fill = container.querySelector(".bs-progress-fill") as HTMLElement;
    expect(fill.style.background).toContain("--danger");
  });
});

describe("Pill", () => {
  it("falls back to neutral when no color given", () => {
    render(<Pill>TPO</Pill>);
    expect(screen.getByText("TPO")).toHaveClass("bs-pill", "bs-pill-neutral");
  });
});
