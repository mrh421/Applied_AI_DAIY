import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Announcer,
  Button,
  Checkbox,
  Collapsible,
  Dialog,
  IconButton,
  Img,
  LinkButton,
  Page,
  Select,
  StatusBadge,
  TextField,
  announce,
} from "./index";

describe("labels and names (CLEAR-LABELS)", () => {
  it("names a button and an icon button by their label", () => {
    render(
      <>
        <Button label="Save" onPress={() => {}} />
        <IconButton label="Delete item" icon="Trash2" onPress={() => {}} />
      </>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete item" })).toBeInTheDocument();
  });

  it("calls onPress and respects disabled", async () => {
    const onPress = vi.fn();
    const { rerender } = render(<Button label="Go" onPress={onPress} />);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(<Button label="Go" onPress={onPress} disabled />);
    expect(screen.getByRole("button", { name: "Go" })).toBeDisabled();
  });

  it("gives buttons a target of at least 24 by 24 CSS pixels (TARGET-SIZE)", () => {
    render(
      <>
        <Button label="Go" onPress={() => {}} />
        <IconButton label="Close" icon="X" onPress={() => {}} />
      </>,
    );
    for (const name of ["Go", "Close"]) {
      const cls = screen.getByRole("button", { name }).className;
      expect(cls).toContain("min-h-6");
      expect(cls).toContain("min-w-6");
    }
  });

  it("labels a text field, a select and a check box", () => {
    render(
      <>
        <TextField label="Problem" value="" onChange={() => {}} />
        <Select
          label="Area"
          value={null}
          options={[{ value: "a", label: "Plumbing" }]}
          onChange={() => {}}
        />
        <Checkbox label="I own it" checked={false} onChange={() => {}} />
      </>,
    );
    expect(screen.getByLabelText("Problem")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Area" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "I own it" })).toBeInTheDocument();
  });

  it("does not render a field without a label", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TextField label="" value="" onChange={() => {}} />)).toThrow();
    spy.mockRestore();
  });

  it("allows paste and reports changes", async () => {
    const onChange = vi.fn();
    render(<TextField label="Name" value="" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Name"));
    await userEvent.paste("abc");
    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("renders a multiline field as a textarea and passes type and autoComplete", () => {
    const { rerender } = render(<TextField label="Notes" value="" onChange={() => {}} multiline />);
    expect(screen.getByLabelText("Notes").tagName).toBe("TEXTAREA");
    rerender(
      <TextField
        label="Secret"
        value=""
        onChange={() => {}}
        type="password"
        autoComplete="current-password"
      />,
    );
    const el = screen.getByLabelText("Secret");
    expect(el).toHaveAttribute("type", "password");
    expect(el).toHaveAttribute("autocomplete", "current-password");
  });
});

describe("errors (ERROR-IDENTIFICATION)", () => {
  it("links the error text to its field and names the field", () => {
    render(<TextField label="Quantity" value="x" onChange={() => {}} error="Enter a number" />);
    const field = screen.getByLabelText("Quantity");
    expect(field).toHaveAttribute("aria-invalid", "true");
    const id = field.getAttribute("aria-describedby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toHaveTextContent("Quantity: Enter a number");
  });

  it("sets no aria-invalid and no description without an error", () => {
    render(<TextField label="Quantity" value="" onChange={() => {}} />);
    const field = screen.getByLabelText("Quantity");
    expect(field).not.toHaveAttribute("aria-invalid", "true");
    expect(field).not.toHaveAttribute("aria-describedby");
  });

  it("shows a select error in text naming the select", () => {
    render(
      <Select label="Area" value={null} options={[]} onChange={() => {}} error="Choose an area" />,
    );
    expect(screen.getByText("Area: Choose an area")).toBeInTheDocument();
  });
});

describe("status messages (STATUS-MESSAGES)", () => {
  it("writes to a polite live region without moving focus", () => {
    render(
      <>
        <button>focus me</button>
        <Announcer />
      </>,
    );
    const btn = screen.getByRole("button", { name: "focus me" });
    btn.focus();
    act(() => announce("Saved"));
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("Saved");
    expect(btn).toHaveFocus();
  });
});

describe("Collapsible (BASICS-EXPANDABLE, KEYBOARD-OPERABLE)", () => {
  it("opens and closes with the keyboard", async () => {
    render(
      <Collapsible summary="Basics" defaultOpen={false}>
        <p>Turn off the water</p>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Basics" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Turn off the water")).not.toBeInTheDocument();
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Turn off the water")).toBeVisible();
    await userEvent.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("starts open when defaultOpen", () => {
    render(
      <Collapsible summary="Basics" defaultOpen>
        <p>Body</p>
      </Collapsible>,
    );
    expect(screen.getByText("Body")).toBeVisible();
  });
});

describe("StatusBadge (NOT-COLOR-ALONE)", () => {
  it("always shows its text", () => {
    render(<StatusBadge tone="warning" icon="TriangleAlert" text="Check locally" />);
    expect(screen.getByText("Check locally")).toBeVisible();
  });
});

describe("Img (TEXT-ALTERNATIVES)", () => {
  it("gives an image its alt text", () => {
    render(<Img src="/a.png" alt="A dripping tap" />);
    expect(screen.getByRole("img", { name: "A dripping tap" })).toBeInTheDocument();
  });

  it("hides a decorative image from assistive technology", () => {
    const { container } = render(<Img src="/a.png" decorative />);
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("throws for an image with neither alt nor decorative", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(<Img {...({ src: "/a.png" } as { src: string; alt: string })} />),
    ).toThrow();
    spy.mockRestore();
  });
});

describe("LinkButton", () => {
  it("opens an external link in a new tab with noopener and says so", () => {
    render(<LinkButton label="Seller" href="https://example.org" external />);
    const a = screen.getByRole("link", { name: /Seller/ });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
    expect(a).toHaveTextContent(/new tab/i);
  });

  it("keeps an internal link in the same tab", () => {
    render(<LinkButton label="Profile" href="/profile" />);
    expect(screen.getByRole("link", { name: "Profile" })).not.toHaveAttribute("target");
  });
});

describe("Dialog", () => {
  it("is titled when open and absent when closed", () => {
    const { rerender } = render(
      <Dialog title="Delete all" open={false} onClose={() => {}}>
        <p>Sure?</p>
      </Dialog>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    rerender(
      <Dialog title="Delete all" open onClose={() => {}}>
        <p>Sure?</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog", { name: "Delete all" })).toBeInTheDocument();
  });

  it("calls onClose on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Dialog title="T" open onClose={onClose}>
        <p>x</p>
      </Dialog>,
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("Page (GO-BACK, REFLOW)", () => {
  it("shows the title as a heading and a working back action", async () => {
    const onBack = vi.fn();
    render(
      <Page title="Materials" back={{ label: "Back to outcome", onBack }}>
        <p>content</p>
      </Page>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Materials" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back to outcome" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("omits the back action when none is given", () => {
    render(
      <Page title="Home">
        <p>c</p>
      </Page>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
