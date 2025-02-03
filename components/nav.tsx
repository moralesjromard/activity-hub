import { UserButton } from "@/components/user-button";
import { ModeToggle } from "@/components/mode-toggle";

export const Nav = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Activity Hub
      </h1>
      <div className="flex gap-4">
        <ModeToggle />
        <UserButton />
      </div>
    </div>
  );
};
