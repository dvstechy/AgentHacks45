import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StockMove {
  id: string;
  createdAt: Date;
  product: {
    name: string;
    sku: string;
  };
  sourceLocation?: {
    name: string;
  } | null;
  destinationLocation?: {
    name: string;
  } | null;
  quantity: number;
  status: string;
  transfer?: {
    reference: string;
    contact?: {
      name: string;
    } | null;
    type: string;
  } | null;
}

interface MovesKanbanProps {
  moves: StockMove[];
}

export function MovesKanban({ moves }: MovesKanbanProps) {
  const groupedMoves = {
    DRAFT: moves.filter((m) => m.status === "DRAFT"),
    WAITING: moves.filter((m) => m.status === "WAITING"),
    READY: moves.filter((m) => m.status === "READY"),
    DONE: moves.filter((m) => m.status === "DONE"),
    CANCELED: moves.filter((m) => m.status === "CANCELED"),
  };

  const columns = [
    { id: "DRAFT", title: "Draft", color: "bg-gray-100" },
    { id: "WAITING", title: "Waiting", color: "bg-yellow-100" },
    { id: "READY", title: "Ready", color: "bg-blue-100" },
    { id: "DONE", title: "Done", color: "bg-green-100" },
  ];

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.id} className="min-w-[300px] flex-1 space-y-4">
          <div className="flex items-center justify-between rounded-md bg-muted p-2">
            <h3 className="font-semibold">{col.title}</h3>
            <Badge variant="secondary">
              {groupedMoves[col.id as keyof typeof groupedMoves]?.length || 0}
            </Badge>
          </div>
          <div className="space-y-2">
            {groupedMoves[col.id as keyof typeof groupedMoves]?.map((move) => (
              <Card key={move.id} className="cursor-pointer hover:shadow-md">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {move.transfer?.reference || "No Ref"}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(move.createdAt), "MMM d")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{move.product.name}</span>
                      <span className="text-muted-foreground">
                        x{move.quantity}
                      </span>
                    </div>
                    {move.transfer?.contact && (
                      <div className="text-xs text-muted-foreground">
                        {move.transfer.contact.name}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <div
                        className={cn(
                          "rounded px-1 py-0.5",
                          move.transfer?.type === "INCOMING"
                            ? "bg-green-100 text-green-700"
                            : move.transfer?.type === "OUTGOING"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        {move.sourceLocation?.name} →{" "}
                        {move.destinationLocation?.name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
