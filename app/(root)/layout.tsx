import { Nav } from "@/components/nav";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Nav />
        {children}
      </div>
    </main>
  );
};
export default RootLayout;
