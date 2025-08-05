import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { Dispatch, SetStateAction } from "react";

type GuidePanelProps = {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  docName: string;
}

export const GuidePanel: React.FC<GuidePanelProps> = ({
  open,
  onOpenChange,
  docName = "generate-images-ai",
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="p-0 border-mountain-200 sm:max-w-120">
      <iframe
        src={`https://artshare-docs.vercel.app/docs/${docName}`}
        title={`ArtShare Documentation - ${docName}`}
        className="w-full h-full"
        style={{ border: "none" }}
      />
    </SheetContent>
  </Sheet>
);

