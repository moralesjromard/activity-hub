"use client";

import { useState, useEffect, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Code,
  MoreVertical,
  Pencil,
  Trash2,
  Save,
  LoaderCircle,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useUserStore } from "@/store/user-store";
import {
  createNotes,
  deleteNotes,
  getNotes,
  updateNotes,
} from "@/actions/note";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

export type Note = {
  id: number;
  user_id: string;
  title: string;
  note: string;
  created_at: string;
  updated_at: string;
};

const NotesPage = () => {
  const { user } = useUserStore();

  const [isPending, startTransition] = useTransition();
  const [isSavePending, startSaveTransition] = useTransition();

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState(notes[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editNote, setEditNote] = useState(selectedNote?.note || "");
  const [editTitle, setEditTitle] = useState(selectedNote?.title || "");
  const [isLoading, setIsLoading] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const handleGetNotes = async () => {
    if (!user?.id) return;

    const result = await getNotes(user?.id);

    if ("error" in result) {
      toast.error(result.message);
      return;
    }

    setNotes(result);
    setSelectedNote(result[0]);
  };

  const handleCreateNote = () => {
    if (!user?.id) return;

    startTransition(async () => {
      const result = await createNotes({ userId: user?.id });

      if (result.error) {
        toast.error(result.message);
        return;
      }

      if (result.success) {
        toast.success(result.message);
        handleGetNotes();
        setSelectedNote(notes[0]);
        setActiveTab("edit");
      }
    });
  };

  const handleDeleteNote = async (noteId: number) => {
    const result = await deleteNotes({ noteId });

    if (result.error) {
      toast.error(result.message);
      return;
    }

    if (result.success) {
      toast.success(result.message);
      handleGetNotes();
    }
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!user?.id) return;

    startSaveTransition(async () => {
      try {
        setIsLoading(true);

        const result = await updateNotes({
          noteId,
          title: editTitle,
          note: editNote,
        });

        if (result.error) {
          toast.error(result.message);
          return;
        }

        if (result.success) {
          // Get fresh notes data
          const updatedNotes = await getNotes(user.id);

          if (!("error" in updatedNotes)) {
            // Update notes list
            setNotes(updatedNotes);

            // Find and set the updated note as selected
            const updatedNote = updatedNotes.find((note) => note.id === noteId);
            if (updatedNote) {
              setSelectedNote(updatedNote);
            }

            setActiveTab("preview");
            toast.success("Note updated successfully");
          }
        }
      } catch (error) {
        toast.error("Failed to update note");
      } finally {
        setIsLoading(false);
      }
    });
  };

  useEffect(() => {
    handleGetNotes();
  }, [user]);

  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditNote(selectedNote.note);
    }
  }, [selectedNote]);

  return (
    <main className="w-full h-full flex justify-center items-start flex-col p-8">
      <header className="flex flex-col mb-6 gap-6 w-full">
        <div className="flex justify-between items-start">
          <div className="flex items-start">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 mr-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold">Markdown Notes</h2>
              <p className="text-muted-foreground">
                Create and manage your markdown notes
              </p>
            </div>
          </div>

          <Button
            className="shadow-lg"
            disabled={isPending}
            onClick={handleCreateNote}
          >
            {isPending ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </>
            )}
          </Button>
        </div>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Markdown Notes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="grid grid-cols-12 gap-6 w-full h-[calc(100vh-280px)]">
        {/* Notes Sidebar */}
        <Card className="col-span-3 overflow-hidden">
          <CardHeader className="p-4 text-2xl font-bold py-5 border-b">
            Notes
          </CardHeader>
          <ScrollArea className="h-[calc(100vh-350px)]">
            <CardContent className="p-2">
              {notes.length > 0 &&
                notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedNote?.id === note.id ? "bg-muted" : ""
                    }`}
                    onClick={() => {
                      setSelectedNote(note);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium line-clamp-1">{note.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="!text-red-600 cursor-pointer"
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(note.updated_at), "MMM d, yyyy")}
                    </p>
                  </div>
                ))}
              {notes.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-16 px-4">
                  <div className="bg-muted/50 p-4 rounded-full">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">No notes yet</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Create your first note by clicking the "New Note" button
                    above
                  </p>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Editor/Preview Area */}
        <Card className="col-span-9 overflow-hidden">
          <CardHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex-1">
                {activeTab === "edit" && (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-[95%] !text-2xl font-bold"
                    placeholder="Title"
                  />
                )}
                {activeTab === "preview" && (
                  <span className="line-clamp-1 text-2xl font-bold px-2">
                    {selectedNote?.title}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 justify-center">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value)}
                >
                  <div className="flex justify-center items-center">
                    <TabsList>
                      <TabsTrigger value="edit">
                        <Code className="mr-2 h-4 w-4" /> Raw
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </Tabs>
                {activeTab === "edit" && (
                  <Button
                    onClick={() => handleUpdateNote(selectedNote?.id)}
                    disabled={isSavePending}
                  >
                    {isSavePending ? (
                      <>
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <ScrollArea className="h-[calc(100vh-350px)]">
            <CardContent className="p-6">
              {activeTab === "edit" ? (
                <Textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="min-h-[calc(100vh-460px)] font-mono"
                  placeholder="Write your note in Markdown..."
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{selectedNote?.note || ""}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => handleDeleteNote(selectedNote?.id)}
        title="Delete note"
        description="Are you sure you want to delete this note?"
        cancelText="Cancel"
        confirmText="Confirm"
        variant="destructive"
      />
    </main>
  );
};

export default NotesPage;
