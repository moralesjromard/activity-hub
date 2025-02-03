// app/(root)/page.test.tsx
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "@/app/(root)/page";
import { ReactNode } from "react";

// Mock next/link
jest.mock(
  "next/link",
  () =>
    function Link({ children, href }: { children: ReactNode; href: string }) {
      return <a href={href}>{children}</a>;
    }
);

// Mock the Lucide icons
jest.mock("lucide-react", () => ({
  CheckSquare: () => <span data-testid="check-square-icon">CheckSquare</span>,
  Image: () => <span data-testid="image-icon">Image</span>,
  Pizza: () => <span data-testid="pizza-icon">Pizza</span>,
  Rabbit: () => <span data-testid="rabbit-icon">Rabbit</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
}));

// Mock the Card components
interface CardProps {
  children: ReactNode;
  className?: string;
}

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: CardProps) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: CardProps) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

describe("HomePage", () => {
  const activities = [
    {
      title: "Todo List",
      description: "Manage your daily tasks",
      href: "/todo",
    },
    {
      title: "Google Drive Lite",
      description: "Upload, manage and search your photos",
      href: "/drive",
    },
    {
      title: "Food Review",
      description: "Share and review your favorite dishes",
      href: "/food",
    },
    {
      title: "Pokemon Review",
      description: "Search and review Pokemon",
      href: "/pokemon",
    },
    {
      title: "Markdown Notes",
      description: "Create and manage your markdown notes",
      href: "/notes",
    },
  ];

  beforeEach(() => {
    render(<HomePage />);
  });

  it("renders all activities", () => {
    activities.forEach((activity) => {
      expect(screen.getByText(activity.title)).toBeInTheDocument();
    });
  });

  it("renders all activity descriptions", () => {
    activities.forEach((activity) => {
      expect(screen.getByText(activity.description)).toBeInTheDocument();
    });
  });

  it("renders correct links for each activity", () => {
    activities.forEach((activity) => {
      const link = screen.getByRole("link", {
        name: new RegExp(activity.title, "i"),
      });
      expect(link).toHaveAttribute("href", activity.href);
    });
  });

  it("renders all icons", () => {
    const icons = [
      "check-square-icon",
      "image-icon",
      "pizza-icon",
      "rabbit-icon",
      "file-text-icon",
    ];

    icons.forEach((icon) => {
      expect(screen.getByTestId(icon)).toBeInTheDocument();
    });
  });

  it("renders the correct number of cards", () => {
    const cards = screen.getAllByTestId("card");
    expect(cards).toHaveLength(5);
  });
});
